"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { supabase } from "@/lib/supabase";
import type { Profile, Todo } from "@/lib/types";

export default function FriendTodosPage({ params }: { params: { id: string } }) {
  return <AuthGate>{() => <FriendTodosContent friendId={params.id} />}</AuthGate>;
}

function FriendTodosContent({ friendId }: { friendId: string }) {
  const [friend, setFriend] = useState<Profile | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);

  async function loadFriendTodos() {
    const [{ data: profile }, { data: todoRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", friendId).maybeSingle(),
      supabase.from("todos").select("*").eq("owner_id", friendId).order("created_at", { ascending: false }),
    ]);
    setFriend(profile);
    setTodos(todoRows ?? []);
  }

  useEffect(() => {
    loadFriendTodos();
    const channel = supabase
      .channel(`friend-todos-${friendId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos", filter: `owner_id=eq.${friendId}` },
        loadFriendTodos,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [friendId]);

  return (
    <section className="cute-panel rounded-3xl p-6">
      <p className="text-sm font-bold text-berry">{friend?.email}</p>
      <h1 className="mb-5 text-3xl font-black text-ink">{friend?.display_name ?? "好友"} 的 Todo</h1>
      <div className="space-y-3">
        {todos.length === 0 && <p className="text-sm font-semibold">这个好友还没有公开可见的待办。</p>}
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            {todo.is_complete ? <CheckCircle2 className="text-mint" /> : <Circle className="text-berry" />}
            <span className={`font-bold ${todo.is_complete ? "text-gray-400 line-through" : "text-ink"}`}>
              {todo.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
