"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/auth");
  }

  return (
    <button
      onClick={signOut}
      className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5"
    >
      <LogOut size={16} />
      退出
    </button>
  );
}
