import Link from "next/link";
import { SignInForm } from "./SignInForm";

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const { callbackUrl } = await searchParams;
  const target = typeof callbackUrl === "string" ? callbackUrl : "";

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
        <SignInForm callbackUrl={target} />
      </div>
    </div>
  );
}
