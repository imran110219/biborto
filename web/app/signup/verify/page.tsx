import Link from "next/link";
import { VerifyForm } from "./VerifyForm";

export default async function VerifyClaimPage({ searchParams }: PageProps<"/signup/verify">) {
  const { token, email } = await searchParams;
  const valid = typeof token === "string" && typeof email === "string" && token && email;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-public p-9">
      {valid ? (
        <VerifyForm token={token} email={email} />
      ) : (
        <div className="flex max-w-[420px] flex-col gap-4 text-center">
          <h1 className="font-serif text-3xl font-medium">Link not valid</h1>
          <p className="text-text-secondary">This verification link is incomplete. Request a new one.</p>
          <Link href="/signup" className="font-semibold text-brand-green">
            Back to claim account
          </Link>
        </div>
      )}
    </div>
  );
}
