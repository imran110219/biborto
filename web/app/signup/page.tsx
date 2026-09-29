import Link from "next/link";
import { SignUpForm } from "./SignUpForm";

export default function SignUpPage() {
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
            Claim your account.
          </h1>
          <p className="max-w-[480px] text-lg leading-relaxed text-brand-green-tint">
            The committee already has your name, discipline and city on file. This step just sets a password
            so you can sign in — not a new application.
          </p>
        </div>

        <span className="text-sm text-brand-green-tint">
          Don&apos;t see your record when you try? Contact the committee.
        </span>
      </div>

      <div className="flex items-center justify-center bg-bg-public p-9 md:p-14">
        <SignUpForm />
      </div>
    </div>
  );
}
