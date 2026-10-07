import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/auth-schema";
import { ChangePasswordForm } from "../ChangePasswordForm";

export default async function AccountSecurityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/account/security");

  const [user] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, session.user.id)).limit(1);

  return (
    <div className="max-w-[520px]">
      <ChangePasswordForm hasPassword={!!user?.passwordHash} />
    </div>
  );
}
