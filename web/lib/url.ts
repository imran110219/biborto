// Website fields (businesses.website, sponsors.website) are stored as
// entered — e.g. "example.com", not "https://example.com" — so using
// one directly as an href makes the browser treat it as a relative path
// on this site instead of an external link.
export function externalUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
