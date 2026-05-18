"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      router.replace(data.session ? "/todos" : "/auth");
    });
  }, [router]);

  return <div className="cute-panel rounded-2xl p-8 text-center">正在进入...</div>;
}
