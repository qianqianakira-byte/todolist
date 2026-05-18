"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { supabase } from "@/lib/supabase";
import type { Friendship } from "@/lib/types";

export default function RequestsPage() {
  return <AuthGate>{(user) => <RequestsContent userId={user.id} />}</AuthGate>;
}

function RequestsContent({ userId }: { userId: string }) {
  const [requests, setRequests] = useState<Friendship[]>([]);

  async function loadRequests() {
    const { data } = await supabase
      .from("friendships")
      .select("*, requester:profiles!friendships_requester_id_fkey(*)")
      .eq("addressee_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setRequests((data as Friendship[]) ?? []);
  }

  useEffect(() => {
    loadRequests();
    const channel = supabase
      .channel(`requests-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships", filter: `addressee_id=eq.${userId}` }, loadRequests)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function answer(id: string, status: "accepted" | "rejected") {
    await supabase.from("friendships").update({ status }).eq("id", id);
    await loadRequests();
  }

  return (
    <section className="cute-panel rounded-3xl p-6">
      <h1 className="mb-4 text-3xl font-black text-ink">好友申请</h1>
      <div className="space-y-3">
        {requests.length === 0 && <p className="text-sm font-semibold">暂时没有新的好友申请。</p>}
        {requests.map((request) => (
          <div key={request.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black">{request.requester?.display_name ?? "新朋友"}</p>
              <p className="text-sm font-semibold text-gray-500">{request.requester?.email}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => answer(request.id, "accepted")} className="grid h-10 w-10 place-items-center rounded-2xl bg-mint text-ink">
                <Check />
              </button>
              <button onClick={() => answer(request.id, "rejected")} className="grid h-10 w-10 place-items-center rounded-2xl bg-pink-100 text-berry">
                <X />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
