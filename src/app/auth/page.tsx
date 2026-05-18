"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: displayName || email.split("@")[0] } },
          });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("注册成功，请先去邮箱确认账号。");
      return;
    }

    router.replace("/todos");
  }

  return (
    <section className="grid min-h-[70vh] place-items-center">
      <div className="cute-panel w-full max-w-md rounded-3xl p-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-berry">多人共享 To Do</p>
            <h1 className="text-3xl font-black text-ink">{mode === "login" ? "欢迎回来" : "创建账号"}</h1>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-pink-100 text-berry">
            <Heart />
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-full bg-orange-50 p-1 text-sm font-bold">
          <button
            className={`rounded-full py-2 ${mode === "login" ? "bg-white shadow-sm" : ""}`}
            onClick={() => setMode("login")}
          >
            登录
          </button>
          <button
            className={`rounded-full py-2 ${mode === "signup" ? "bg-white shadow-sm" : ""}`}
            onClick={() => setMode("signup")}
          >
            注册
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <input
              className="w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 outline-none focus:border-berry"
              placeholder="昵称"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          )}
          <input
            className="w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 outline-none focus:border-berry"
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            className="w-full rounded-2xl border border-orange-100 bg-white px-4 py-3 outline-none focus:border-berry"
            type="password"
            placeholder="密码"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />
          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-berry px-4 py-3 font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            <Sparkles size={18} />
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
          </button>
        </form>

        {message && <p className="mt-4 rounded-2xl bg-pink-50 px-4 py-3 text-sm font-semibold text-ink">{message}</p>}
      </div>
    </section>
  );
}
