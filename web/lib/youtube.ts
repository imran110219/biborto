// Gallery videos are YouTube-only. Everything stored or rendered goes
// through the 11-character video ID, so no arbitrary URL ever reaches an
// <iframe src> or <a href>.
const ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com", "youtu.be"]);

export function parseYoutubeId(raw: string): string | undefined {
  const value = raw.trim();
  if (!value || value.length > 300) return undefined;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return undefined;
  }
  if (!HOSTS.has(url.hostname.toLowerCase())) return undefined;

  let id: string | undefined | null;
  if (url.hostname.toLowerCase() === "youtu.be") {
    id = url.pathname.split("/")[1];
  } else if (url.pathname === "/watch") {
    id = url.searchParams.get("v");
  } else {
    const [, kind, rest] = url.pathname.split("/");
    if (kind === "embed" || kind === "shorts" || kind === "live" || kind === "v") id = rest;
  }
  return id && ID.test(id) ? id : undefined;
}

export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const youtubeEmbedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
export const youtubeThumbnailUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
