import { and, count, countDistinct, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { galleryAlbums, galleryPhotos, members } from "@/drizzle/schema";

export interface HomeStats {
  registeredBatchmates: number;
  disciplinesRepresented: number;
  countriesRepresented: number;
  photosInArchive: number;
}

// Real counts, not the mockup's bracketed placeholders — so these will
// legitimately read low (e.g. 0 countries) until members actually fill
// in that field. That's accurate, not broken.
export async function getHomeStats(): Promise<HomeStats> {
  const [memberStats] = await db
    .select({
      registeredBatchmates: count(),
      disciplinesRepresented: countDistinct(members.disciplineId),
      countriesRepresented: countDistinct(members.countryId),
    })
    .from(members)
    .where(and(eq(members.status, "active"), eq(members.isPublic, true)));

  // Only photos in public albums count towards the public "photos in the archive" stat.
  const [photoStats] = await db
    .select({ photosInArchive: count() })
    .from(galleryPhotos)
    .innerJoin(galleryAlbums, eq(galleryAlbums.id, galleryPhotos.albumId))
    .where(eq(galleryAlbums.isPublic, true));

  return {
    registeredBatchmates: memberStats?.registeredBatchmates ?? 0,
    disciplinesRepresented: memberStats?.disciplinesRepresented ?? 0,
    countriesRepresented: memberStats?.countriesRepresented ?? 0,
    photosInArchive: photoStats?.photosInArchive ?? 0,
  };
}
