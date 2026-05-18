"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { SignOutButton } from "@/components/SignOutButton";
import { supabase } from "@/lib/supabase";
import type { Todo } from "@/lib/types";

export default function TodosPage() {
  return (
    <AuthGate>
      {(user) => <TodosContent userId={user.id} email={user.email ?? ""} />}
    </AuthGate>
  );
}

function TodosContent({ userId, email }: { userId: string; email: string }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTodos() {
    const { data } = await supabase
      .from("todos")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    setTodos(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadTodos();
    const channel = supabase
      .channel(`my-todos-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos", filter: `owner_id=eq.${userId}` },
        loadTodos,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function addTodo(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    await supabase.from("todos").insert({ title: title.trim(), owner_id: userId });
    setTitle("");
    await loadTodos();
  }

  async function toggleTodo(todo: Todo) {
    await supabase.from("todos").update({ is_complete: !todo.is_complete }).eq("id", todo.id);
    await loadTodos();
  }

  return (
    <section className="space-y-6">
      <div className="cute-panel flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-berry">{email}</p>
          <h1 className="text-3xl font-black text-ink">我的 Todo</h1>
        </div>
        <SignOutButton />
      </div>

      <form onSubmit={addTodo} className="cute-panel flex gap-3 rounded-3xl p-4">
        <input
          className="min-w-0 flex-1 rounded-2xl border border-orange-100 bg-white px-4 py-3 outline-none focus:border-berry"
          placeholder="今天想完成什么？"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint font-black text-ink transition hover:-translate-y-0.5">
          <Plus />
        </button>
      </form>

      <div className="cute-panel rounded-3xl p-4">
        {loading && <p className="p-4 text-sm font-semibold">正在加载...</p>}
        {!loading && todos.length === 0 && <p className="p-4 text-sm font-semibold">还没有待办，先写下一件小事吧。</p>}
        <div className="space-y-3">
          {todos.map((todo) => (
            <button
              key={todo.id}
              onClick={() => toggleTodo(todo)}
              className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left transition hover:-translate-y-0.5"
            >
              {todo.is_complete ? <CheckCircle2 className="text-mint" /> : <Circle className="text-berry" />}
              <span className={`font-bold ${todo.is_complete ? "text-gray-400 line-through" : "text-ink"}`}>
                {todo.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
