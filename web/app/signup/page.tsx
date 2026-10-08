import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { getBrand } from "@/lib/settings";
import { SignUpForm } from "./SignUpForm";

export default async function SignUpPage() {
  const brand = await getBrand();
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-between gap-10 bg-brand-green-dark p-9 text-bg-public md:p-[72px]">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark brand={brand} tone="dark" />
        </Link>

        <div className="flex flex-col gap-5">
          <h1 className="font-serif text-5xl font-medium leading-[1.05] tracking-tight">
            Activate your account.
          </h1>
          <p className="max-w-[480px] text-lg leading-relaxed text-brand-green-tint">
            Members are added by the committee using their email and roll. If yours is on the list, activate your
            account here with Google, or with a verification link sent to that email. There is no public sign-up.
          </p>
        </div>

        <span className="text-sm text-brand-green-tint">
          Not on the list, or the email changed? Contact the committee and they will add or update it.
        </span>
      </div>

      <div className="flex items-center justify-center bg-bg-public p-9 md:p-14">
        <SignUpForm />
      </div>
    </div>
  );
}
