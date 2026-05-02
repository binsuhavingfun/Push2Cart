import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid review ID." }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  if (!(await isAdminUser(supabase, user.id))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
