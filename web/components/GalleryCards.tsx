import Link from "next/link";
import Image from "next/image";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";

export function AlbumCard({ slug, name, count, coverImageUrl }: { slug: string; name: string; count: string; coverImageUrl?: string }) {
  return (
    <Link href={`/gallery/${slug}`} className="flex flex-col gap-3.5 text-text-primary">
      {coverImageUrl ? (
        <div className="relative h-[260px] overflow-hidden rounded-2xl">
          <Image src={coverImageUrl} alt={`${name} album cover`} fill unoptimized className="object-cover" />
        </div>
      ) : (
        <PlaceholderMedia label="[Album cover]" className="h-[260px]" />
      )}
      <div className="flex items-baseline justify-between">
        <span className="font-serif text-xl font-medium">{name}</span>
        <span className="text-sm text-text-secondary">{count}</span>
      </div>
    </Link>
  );
}
