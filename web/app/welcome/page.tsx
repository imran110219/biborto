import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/auth-schema";
import { disciplines, members } from "@/drizzle/schema";
import { getBrand } from "@/lib/settings";
import { BrandMark } from "@/components/layout/BrandMark";
import { WelcomeForm } from "./WelcomeForm";

export const metadata = { title: "Welcome" };

export default async function WelcomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/welcome");

  const [row] = await db
    .select({
      name: members.name,
      email: members.email,
      roll: members.studentId,
      discipline: disciplines.name,
      completed: members.profileCompletedAt,
      accountName: users.name,
    })
    .from(members)
    .leftJoin(disciplines, eq(disciplines.id, members.disciplineId))
    .leftJoin(users, eq(users.id, members.userId))
    .where(eq(members.userId, session.user.id))
    .limit(1);
  if (!row) redirect("/signin");
  if (row.completed) redirect("/account");

  // A Google sign-in brings the person's real name; otherwise there's only the stand-in made from the email.
  const suggestedName = row.accountName && row.accountName !== row.name ? row.accountName : "";
  const brand = await getBrand();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-bg-public p-6">
      <div className="flex items-center gap-3 text-text-primary">
        <BrandMark brand={brand} />
      </div>
      <WelcomeForm
        batchName={brand.batchName}
        email={row.email}
        roll={row.roll ?? ""}
        discipline={row.discipline ?? ""}
        suggestedName={suggestedName}
      />
    </div>
  );
}
