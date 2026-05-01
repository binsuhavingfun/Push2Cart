"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function ProfileLogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      Logout
    </button>
  );
}
