// Website fields (businesses.website, sponsors.website) are stored as
// entered — e.g. "example.com", not "https://example.com" — so using
// one directly as an href makes the browser treat it as a relative path
// on this site instead of an external link.
export function externalUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

// Validates a user-entered website for storage. Accepts bare domains
// ("example.com") and http(s) URLs; rejects any other scheme
// (javascript:, data:, ...) and anything that doesn't parse. Returns the
// normalized URL, null for an empty input, or undefined when invalid.
export function parseWebsite(raw: string): string | null | undefined {
  const value = raw.trim();
  if (!value) return null;
  if (value.length > 300 || /\s/.test(value)) return undefined;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) && !/^[^/]+:\d+(\/|$)/.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    if (!url.hostname.includes(".")) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}
