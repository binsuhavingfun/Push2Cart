"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useAdminStatus() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (authLoading) {
      return;
    }

    if (!supabase || !user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    const checkAdmin = async () => {
      try {
        const { data } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!active) {
          return;
        }

        setIsAdmin(Boolean(data));
      } catch {
        if (!active) {
          return;
        }

        setIsAdmin(false);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void checkAdmin();

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  return {
    isAdmin,
    loading: authLoading || loading
  };
}
