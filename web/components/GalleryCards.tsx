import Link from "next/link";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { PlayIcon } from "@/components/ui/icons";

export function AlbumCard({ name, count }: { name: string; count: string }) {
  return (
    <Link href="#" className="flex flex-col gap-3.5 text-text-primary">
      <PlaceholderMedia label="[Album cover]" className="h-[260px]" />
      <div className="flex items-baseline justify-between">
        <span className="font-serif text-xl font-medium">{name}</span>
        <span className="text-sm text-text-secondary">{count}</span>
      </div>
    </Link>
  );
}

export function VideoCard({ title }: { title: string }) {
  return (
    <article className="flex flex-col gap-3.5">
      <a
        href="#"
        aria-label="Play video"
        className="relative flex h-[234px] items-center justify-center rounded-2xl bg-video-dark"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-public text-text-primary">
          <PlayIcon />
        </span>
        <span className="absolute bottom-3.5 right-3.5 rounded-md bg-text-primary px-2 py-1 text-xs font-semibold text-bg-public">
          [mm:ss]
        </span>
        <span className="absolute left-4 top-3.5 text-xs text-white/80">[YouTube thumbnail]</span>
      </a>
      <h3 className="text-lg font-semibold leading-snug">{title}</h3>
      <span className="flex items-center gap-2 text-sm text-text-secondary">YouTube · Batch 11 channel</span>
    </article>
  );
}
