import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { getBrand } from "@/lib/settings";
import { SignUpForm } from "./SignUpForm";

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const brand = await getBrand();
  const { request } = await searchParams;
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-between gap-10 bg-brand-green-dark p-9 text-bg-public md:p-[72px]">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark brand={brand} tone="dark" />
        </Link>

        <div className="flex flex-col gap-5">
          <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight">
            Claim your account.
          </h1>
          <p className="max-w-[480px] text-lg leading-relaxed text-brand-green-tint">
            Sign in with your committee-listed email to access your member profile. If we don&apos;t have your
            record yet, your Google sign-in will send a request to the admins for review.
          </p>
        </div>

        <span className="text-sm text-brand-green-tint">
          Don&apos;t see your record when you try? Contact the committee.
        </span>
      </div>

      <div className="flex items-center justify-center bg-bg-public p-9 md:p-14">
        <SignUpForm requestPending={request === "pending"} />
      </div>
    </div>
  );
}
