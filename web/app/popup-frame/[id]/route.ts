import { auth } from "@/auth";
import { getAdminPopupById } from "@/lib/db/queries/popups";
import { popupFrameDocument } from "@/lib/popups/frame";
import { POPUP_FRAME_CSP } from "@/lib/security/csp";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Serves a custom-HTML popup as its own document, for the home page's <iframe src>.
// Being a separate document means it gets this response's Content-Security-Policy
// (POPUP_FRAME_CSP: sandboxed to an opaque origin, no script network access) rather
// than inheriting the site's strict policy, which would block its inline scripts.
// Visitors can fetch only the *active* popup; a superadmin may also preview inactive ones.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  if (!UUID.test(id)) return notFound();

  const popup = await getAdminPopupById(id);
  if (!popup || popup.kind !== "html" || !popup.htmlContent.trim()) return notFound();

  if (!popup.active) {
    const session = await auth();
    if (session?.user?.platformRole !== "superadmin") return notFound();
  }

  return new Response(popupFrameDocument(popup.htmlContent), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": POPUP_FRAME_CSP,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "private, no-store",
    },
  });
}
