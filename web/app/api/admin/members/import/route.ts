import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/auth/require-admin";
import { logActivity } from "@/lib/activity";
import { ImportFileError, MAX_IMPORT_BYTES, analyzeImport, applyImport, type ImportOptions } from "@/lib/members/import";

export const runtime = "nodejs";

// Superadmin-only member CSV import. One endpoint, two intents:
//   intent=preview  → analyze the file, change nothing
//   intent=apply    → re-analyze the same file on the server and write it in one transaction
// The client re-sends the file for "apply"; nothing from the preview is trusted.
export async function POST(request: Request) {
  let actorId: string;
  try {
    actorId = await requireSuperadmin();
  } catch {
    return NextResponse.json({ error: "Only a superadmin can import members." }, { status: 403 });
  }

  // Cookies are SameSite=Lax already; this also refuses a cross-origin POST outright.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin && origin !== `${request.headers.get("x-forwarded-proto") ?? "http"}://${request.headers.get("host")}`) {
    return NextResponse.json({ error: "Cross-origin request refused." }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose a CSV file." }, { status: 400 });
  if (file.size > MAX_IMPORT_BYTES) return NextResponse.json({ error: "The file is larger than 1 MB." }, { status: 413 });

  const intent = form?.get("intent") === "apply" ? "apply" : "preview";
  const options: ImportOptions = {
    updateExisting: form?.get("updateExisting") === "on",
    newStatus: form?.get("newStatus") === "pending" ? "pending" : "active",
  };
  const text = await file.text();

  if (intent === "preview") {
    return NextResponse.json({ intent, analysis: await analyzeImport(text, options) });
  }

  try {
    const result = await applyImport(text, options, actorId);
    if (result.created + result.updated > 0) {
      await logActivity({
        actorId,
        action: "member.imported",
        targetType: "member",
        summary: `{actor} imported members from CSV (${result.created} added, ${result.updated} updated)`,
      });
      revalidatePath("/admin/members");
      revalidatePath("/admin/dashboard");
      revalidatePath("/members");
    }
    return NextResponse.json({ intent, result });
  } catch (error) {
    console.error("member import failed", error);
    return NextResponse.json({ error: error instanceof ImportFileError ? error.message : "The import failed and nothing was changed." }, { status: error instanceof ImportFileError ? 400 : 500 });
  }
}
