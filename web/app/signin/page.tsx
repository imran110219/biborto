import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { getBrand } from "@/lib/settings";
import { SignInForm } from "./SignInForm";

// Auth.js reports a failed sign-in as ?error=<Type>. AccessDenied is the expected one (the email isn't
// on the roster, or the member isn't active); everything else is a problem on our side or a stale link.
function signInNotice(error: string | undefined): string | undefined {
  if (!error) return undefined;
  if (error === "AccessDenied") {
    return "That Google account isn't on the member roster, or the membership isn't active. Sign in with the email the committee has for you, or ask the committee to add it.";
  }
  if (error === "OAuthAccountNotLinked") {
    return "That email is already linked to another way of signing in. Use the method you used before.";
  }
  if (error === "Verification" || error === "MissingCSRF" || error === "CredentialsSignin") return undefined;
  return "Google sign-in didn't complete. Please try again, or sign in with your email and password. If it keeps happening, tell the committee.";
}

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const brand = await getBrand();
  const { callbackUrl, reset, denied, error } = await searchParams;
  const target = typeof callbackUrl === "string" ? callbackUrl : "";

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-between gap-10 bg-brand-green-dark p-9 text-bg-public md:p-[72px]">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark brand={brand} tone="dark" />
        </Link>

        <div className="flex flex-col gap-5">
          <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight">
            Welcome back, batchmate.
          </h1>
          <p className="max-w-[480px] text-lg leading-relaxed text-brand-green-tint">
            Sign in to RSVP for events, keep your profile up to date, write for the blog and list your business. Committee
            admins manage the site from here.
          </p>
        </div>

        <span className="text-sm text-brand-green-tint">Only verified {brand.batchName} members can sign in.</span>
      </div>

      <div className="flex items-center justify-center bg-bg-public p-9 md:p-14">
        <SignInForm callbackUrl={target} passwordReset={reset === "1"} notice={signInNotice(typeof error === "string" ? error : denied === "1" ? "AccessDenied" : undefined)} />
      </div>
    </div>
  );
}
