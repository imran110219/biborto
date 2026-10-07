import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/client";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/auth-schema";
import { members } from "@/drizzle/schema";
import { clientIp, consume, normalizeKeyPart, peek, reset } from "@/lib/security/rate-limit";
import { LIMITS } from "@/lib/security/limits";

// A genuine bcrypt hash, compared against when the email is unknown so a missing
// account takes as long to reject as a wrong password does (no timing oracle).
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password-used-for-timing", 10);

export const signInKeys = (email: string, ip: string) => ({
  pair: `signin:pair:${normalizeKeyPart(email)}|${ip}`,
  email: `signin:email:${normalizeKeyPart(email)}`,
  ip: `signin:ip:${ip}`,
});

/** Seconds until sign-in is allowed again for this email/IP, or 0 when it is. */
export async function signInLockSeconds(email: string, ip: string): Promise<number> {
  const keys = signInKeys(email, ip);
  const [pair, perEmail, perIp] = await Promise.all([
    peek(keys.pair, LIMITS.signInPair),
    peek(keys.email, LIMITS.signInEmail),
    peek(keys.ip, LIMITS.signInIp),
  ]);
  return Math.max(...[pair, perEmail, perIp].map((r) => (r.blocked ? r.retryAfterSeconds : 0)));
}

// Members are committee-entered before anyone ever logs in (see
// db/schema.sql's comment on `members`) — there is no open signup.
// Signing in (either provider) requires an existing, active `members`
// row matching the email; claiming an account (creating the `users` row
// in the first place) happens in the /signup Server Action, not here —
// see that file for why `status = 'pending'` is allowed to claim but not
// to sign in.
async function activeMemberByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const [member] = await db
    .select()
    .from(members)
    .where(sql`lower(${members.email}) = ${normalizedEmail}`)
    .limit(1);
  return member && member.status === "active" ? member : null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // No hosting target picked yet (see docs/README.md's Target stack) —
  // Auth.js otherwise rejects any Host header it hasn't been told to
  // trust via AUTH_URL. Safe as long as whatever ends up in front of
  // this app (reverse proxy, CDN) sets Host correctly; revisit if that
  // ever isn't guaranteed.
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Database sessions are incompatible with the Credentials provider
  // (Auth.js requirement, not a choice made here) — JWT for both
  // providers, so Google sign-ins behave the same way as credentials
  // ones rather than splitting session strategy per provider.
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days; admin actions re-check the DB anyway
  pages: { signIn: "/signin" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        // Returns null (never a distinguishing error) for every failure
        // case — wrong password, no account, unclaimed member, no
        // longer active — so the sign-in form can't be used to probe
        // which emails are registered.
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;
        const normalizedEmail = email.trim().toLowerCase();

        // Brute-force protection lives here, not only in the sign-in form's action,
        // because anyone can POST straight to /api/auth/callback/credentials.
        const ip = clientIp(request.headers);
        if ((await signInLockSeconds(normalizedEmail, ip)) > 0) return null;
        const keys = signInKeys(normalizedEmail, ip);
        const fail = async () => {
          await Promise.all([
            consume(keys.pair, LIMITS.signInPair),
            consume(keys.email, LIMITS.signInEmail),
            consume(keys.ip, LIMITS.signInIp),
          ]);
          return null;
        };

        const [user] = await db
          .select()
          .from(users)
          .where(sql`lower(${users.email}) = ${normalizedEmail}`)
          .limit(1);
        if (!user?.passwordHash) {
          await bcrypt.compare(password, DUMMY_HASH);
          return fail();
        }
        if (!(await bcrypt.compare(password, user.passwordHash))) return fail();

        const member = await activeMemberByEmail(normalizedEmail);
        if (!member) return fail(); // claimed, but not (or no longer) an active member

        await reset(keys.pair); // a good sign-in clears this pair's failures (the per-email/IP ceilings keep counting)
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    Google({ allowDangerousEmailAccountLinking: true }),
  ],
  callbacks: {
    // Runs for every sign-in attempt, both providers. For Google this is
    // what actually gates access — there's no separate "claim" step for
    // OAuth, so an unrecognized or non-active email is rejected right
    // here, before the adapter creates any user/account row.
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") return true; // already gated in authorize()
      if (!user.email) return false;
      // Email-based linking is enabled for Google so a Gmail identity can
      // attach to a previously claimed member account. Only accept Google's
      // verified email assertion before matching it to the committee record.
      if (account?.provider === "google" && profile?.email_verified !== true) return false;
      const normalizedEmail = user.email.trim().toLowerCase();
      const [member] = await db
        .select({ id: members.id, status: members.status })
        .from(members)
        .where(sql`lower(${members.email}) = ${normalizedEmail}`)
        .limit(1);

      if (member) return member.status === "active";

      // A verified Google identity with no committee-entered record becomes
      // a private membership request. Do not create the Auth.js user/session
      // until an admin approves the request and the person signs in again.
      await db
        .insert(members)
        .values({
          slug: `google-${account?.providerAccountId ?? normalizedEmail.replace(/[^a-z0-9]+/g, "-")}`,
          name: user.name?.trim() || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          platformRole: "member",
          status: "pending",
          isPublic: false,
        })
        .onConflictDoNothing({ target: members.email });
      return false;
    },
    // The token carries the member's role so the proxy and pages can gate /admin/**
    // without a lookup of their own — but a role in a token goes stale: a demoted
    // admin or a suspended member would keep access until the token expires (7
    // days). So on every request after sign-in the member row is re-read here: a
    // changed role takes effect immediately, and a member who is no longer active
    // (suspended, deleted) gets their session ended — returning null from this
    // callback clears the session. It is one indexed lookup per request. (Next 16's
    // proxy runs on Node.js, so this works there too.)
    async jwt({ token, user }) {
      const userId = user?.id ?? (token.userId as string | undefined);
      if (!userId) return token;

      const [member] = await db
        .select({ id: members.id, platformRole: members.platformRole, status: members.status })
        .from(members)
        .where(eq(members.userId, userId))
        .limit(1);

      if (user?.id) {
        // Signing in: the sign-in gates already required an active member.
        token.userId = user.id;
        token.platformRole = member?.platformRole ?? "member";
        token.memberId = member?.id;
        return token;
      }

      if (!member || member.status !== "active") return null; // end the session
      token.platformRole = member.platformRole;
      token.memberId = member.id;
      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = token.userId as string;
        session.user.platformRole = token.platformRole as "member" | "admin" | "superadmin";
        session.user.memberId = token.memberId as string | undefined;
      }
      return session;
    },
  },
  events: {
    // First-time Google sign-in: the adapter has just created `users`
    // for an email signIn() already confirmed matches an active member.
    // Link it the same way the /signup Server Action links a credentials
    // claim, so both paths converge on the same members.user_id state.
    async createUser({ user }) {
      if (!user.email || !user.id) return;
      await db
        .update(members)
        .set({ userId: user.id })
        .where(sql`lower(${members.email}) = ${user.email.trim().toLowerCase()}`);
    },
  },
});
