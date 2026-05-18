"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Search, UserRoundPlus } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { supabase } from "@/lib/supabase";
import type { Friendship, Profile } from "@/lib/types";

export default function FriendsPage() {
  return <AuthGate>{(user) => <FriendsContent userId={user.id} />}</AuthGate>;
}

function FriendsContent({ userId }: { userId: string }) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");

  async function loadFriends() {
    const { data } = await supabase
      .from("friendships")
      .select("*, requester:profiles!friendships_requester_id_fkey(*), addressee:profiles!friendships_addressee_id_fkey(*)")
      .eq("status", "accepted")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .order("updated_at", { ascending: false });
    setFriends((data as Friendship[]) ?? []);
  }

  useEffect(() => {
    loadFriends();
    const channel = supabase
      .channel(`friends-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, loadFriends)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function searchUser() {
    setMessage("");
    setResult(null);
    const { data, error } = await supabase.from("profiles").select("*").ilike("email", email.trim()).maybeSingle();
    if (error || !data || data.id === userId) {
      setMessage("没有找到这个用户，或者这是你自己的邮箱。");
      return;
    }
    setResult(data);
  }

  async function sendRequest() {
    if (!result) return;
    const { error } = await supabase.from("friendships").insert({
      requester_id: userId,
      addressee_id: result.id,
      status: "pending",
    });
    setMessage(error ? error.message : "好友申请已发送。");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="cute-panel rounded-3xl p-6">
        <h1 className="mb-4 text-3xl font-black text-ink">添加好友</h1>
        <div className="flex gap-3">
          <input
            className="min-w-0 flex-1 rounded-2xl border border-orange-100 bg-white px-4 py-3 outline-none focus:border-berry"
            type="email"
            placeholder="输入好友邮箱"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button onClick={searchUser} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-berry text-white">
            <Search />
          </button>
        </div>
        {result && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4">
            <div>
              <p className="font-black">{result.display_name ?? "未命名用户"}</p>
              <p className="text-sm font-semibold text-gray-500">{result.email}</p>
            </div>
            <button onClick={sendRequest} className="rounded-2xl bg-mint px-4 py-2 font-black text-ink">
              申请
            </button>
          </div>
        )}
        {message && <p className="mt-4 rounded-2xl bg-pink-50 px-4 py-3 text-sm font-semibold">{message}</p>}
      </div>

      <div className="cute-panel rounded-3xl p-6">
        <h2 className="mb-4 text-3xl font-black text-ink">好友列表</h2>
        <div className="space-y-3">
          {friends.length === 0 && <p className="text-sm font-semibold">还没有已通过的好友。</p>}
          {friends.map((friendship) => {
            const friend = friendship.requester_id === userId ? friendship.addressee : friendship.requester;
            if (!friend) return null;
            return (
              <Link
                href={`/friends/${friend.id}`}
                key={friendship.id}
                className="flex items-center justify-between rounded-2xl bg-white p-4 transition hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100 text-berry">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-black">{friend.display_name ?? "好友"}</p>
                    <p className="text-sm font-semibold text-gray-500">{friend.email}</p>
                  </div>
                </div>
                <UserRoundPlus className="text-mint" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
