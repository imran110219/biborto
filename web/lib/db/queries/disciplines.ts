import { db } from "@/lib/db/client";
import { disciplines } from "@/drizzle/schema";

export interface DisciplineOption {
  id: string;
  name: string;
}

// Populates the discipline <select> on the admin member edit form.
export async function getDisciplineOptions(): Promise<DisciplineOption[]> {
  const rows = await db
    .select({ id: disciplines.id, name: disciplines.name })
    .from(disciplines)
    .orderBy(disciplines.name);

  return rows;
}
