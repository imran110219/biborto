import Link from "next/link";
import { LockIcon, MailIcon } from "@/components/ui/icons";

export default function SignInPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-between gap-10 bg-brand-green-dark p-9 text-bg-public md:p-[72px]">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-bg-public font-serif text-lg font-semibold text-brand-green">
            11
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold">Batch 11</span>
            <span className="text-sm text-brand-green-tint">Khulna University</span>
          </div>
        </Link>

        <div className="flex flex-col gap-5">
          <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight">
            Welcome back, batchmate.
          </h1>
          <p className="max-w-[480px] text-lg leading-relaxed text-brand-green-tint">
            Sign in to RSVP for events, update your profile, share photos and write for the blog. Committee
            admins manage the site from here.
          </p>
        </div>

        <span className="text-sm text-brand-green-tint">Only verified Batch 11 members can sign in.</span>
      </div>

      <div className="flex items-center justify-center bg-bg-public p-9 md:p-14">
        <form aria-label="Sign in" className="flex w-full max-w-[420px] flex-col gap-[22px]">
          <div>
            <h2 className="font-serif text-3xl font-medium">Sign in</h2>
            <p className="mt-1 text-text-secondary">Use the email you registered with.</p>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Email
            <span className="relative flex items-center">
              <span className="absolute left-3.5 text-text-secondary">
                <MailIcon />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className="h-[52px] w-full rounded-xl border border-border-input pl-11 pr-4 font-normal"
              />
            </span>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Password
            <span className="relative flex items-center">
              <span className="absolute left-3.5 text-text-secondary">
                <LockIcon size={16} />
              </span>
              <input
                type="password"
                placeholder="Your password"
                className="h-[52px] w-full rounded-xl border border-border-input pl-11 pr-4 font-normal"
              />
            </span>
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2.5">
              <input type="checkbox" className="h-[18px] w-[18px] accent-brand-green" />
              Keep me signed in
            </label>
            <Link href="#" className="font-semibold text-brand-green">
              Forgot password?
            </Link>
          </div>

          <Link
            href="/admin/dashboard"
            className="flex h-[52px] items-center justify-center rounded-xl bg-brand-green text-white font-semibold"
          >
            Sign in
          </Link>

          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="h-px flex-1 bg-border-default" />
            or
            <span className="h-px flex-1 bg-border-default" />
          </div>

          <button
            type="button"
            className="flex h-[52px] items-center justify-center rounded-xl border border-border-input bg-white font-semibold"
          >
            Continue with Google
          </button>

          <p className="text-center text-sm text-text-secondary">
            Not registered yet?{" "}
            <Link href="#" className="font-semibold text-brand-green">
              Request membership
            </Link>
          </p>
          <Link href="/" className="text-center text-sm font-semibold text-brand-green">
            Back to the public site
          </Link>
        </form>
      </div>
    </div>
  );
}
