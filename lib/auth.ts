import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function requireUser(redirectTo: string) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    redirect(`/auth?next=${encodeURIComponent(redirectTo)}`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?next=${encodeURIComponent(redirectTo)}`);
  }

  return { supabase, user };
}
