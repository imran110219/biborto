// Wraps superadmin-supplied popup markup in a minimal HTML document. Links open in
// a new tab (<base target>), and the page gets no margin so it fills the frame.
export function popupFrameDocument(html: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base target="_blank"><style>html,body{margin:0}</style></head><body>${html}</body></html>`;
}
