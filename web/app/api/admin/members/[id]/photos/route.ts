import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/require-admin";
import { uploadMemberPhoto } from "@/lib/members/photo-upload";

export const runtime = "nodejs";

// Superadmin-only: set any member's profile or cover photo. Members set their
// own through /api/account/photos.
export async function POST(request: Request, { params }: RouteContext<"/api/admin/members/[id]/photos">) {
  try {
    await requireSuperadmin();
  } catch {
    return NextResponse.json({ error: "Only a superadmin can upload member photos." }, { status: 403 });
  }

  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Choose a valid member." }, { status: 400 });
  }
  return uploadMemberPhoto(request, id);
}
