import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function requireAdmin(path: string) {
  const { supabase, user } = await requireUser(path);

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  return { supabase, user };
}
