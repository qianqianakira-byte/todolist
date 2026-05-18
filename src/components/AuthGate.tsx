"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function AuthGate({ children }: { children: (user: User) => ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth");
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, [router]);

  if (loading || !user) {
    return <div className="cute-panel rounded-2xl p-8 text-center">正在检查登录状态...</div>;
  }

  return children(user);
}
