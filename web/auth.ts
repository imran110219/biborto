import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/client";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/auth-schema";
import { members } from "@/drizzle/schema";

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
      async authorize(credentials) {
        // Returns null (never a distinguishing error) for every failure
        // case — wrong password, no account, unclaimed member, no
        // longer active — so the sign-in form can't be used to probe
        // which emails are registered.
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;
        const normalizedEmail = email.trim().toLowerCase();

        const [user] = await db
          .select()
          .from(users)
          .where(sql`lower(${users.email}) = ${normalizedEmail}`)
          .limit(1);
        if (!user?.passwordHash) return null;
        if (!(await bcrypt.compare(password, user.passwordHash))) return null;

        const member = await activeMemberByEmail(normalizedEmail);
        if (!member) return null; // claimed, but not (or no longer) an active member

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
    // Role goes into the token (not re-fetched from the DB on every
    // request) specifically so middleware.ts can gate /admin/** by role
    // from the decoded JWT alone — middleware runs on the Edge runtime,
    // where `postgres` (a raw TCP driver) doesn't work. A role change
    // takes effect on that member's next sign-in, not instantly.
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
        const [member] = await db
          .select({ id: members.id, platformRole: members.platformRole })
          .from(members)
          .where(eq(members.userId, user.id))
          .limit(1);
        token.platformRole = member?.platformRole ?? "member";
        token.memberId = member?.id;
      }
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
