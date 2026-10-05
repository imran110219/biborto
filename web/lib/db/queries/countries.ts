import { db } from "@/lib/db/client";
import { countries } from "@/drizzle/schema";

export interface CountryOption {
  id: string;
  name: string;
}

// Populates the country <select> on the admin member edit form.
export async function getCountryOptions(): Promise<CountryOption[]> {
  return db.select({ id: countries.id, name: countries.name }).from(countries).orderBy(countries.name);
}
