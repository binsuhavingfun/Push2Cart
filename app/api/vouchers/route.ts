import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ vouchers: [] });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ vouchers: [] });
  }

  const { data } = await supabase
    .from("vouchers")
    .select("id, code, discount_percent")
    .eq("user_id", user.id)
    .eq("is_used", false)
    .order("created_at", { ascending: false });

  return NextResponse.json({ vouchers: data ?? [] });
}
