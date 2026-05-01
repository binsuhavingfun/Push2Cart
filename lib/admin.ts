import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function isAdminUser(supabase: any, userId: string) {
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data);
}

export async function getServerAdminState() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return false;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  return isAdminUser(supabase, user.id);
}

export async function requireAdmin(path: string) {
  const { supabase, user } = await requireUser(path);

  if (!(await isAdminUser(supabase, user.id))) {
    notFound();
  }

  return { supabase, user };
}

export async function requireCustomerUser(path: string) {
  const { supabase, user } = await requireUser(path);

  if (await isAdminUser(supabase, user.id)) {
    redirect("/admin");
  }

  return { supabase, user };
}
