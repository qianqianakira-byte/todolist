import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shared Todo Garden",
  description: "A cute shared todo list powered by Supabase",
};

const navItems = [
  { href: "/todos", label: "我的 Todo" },
  { href: "/friends", label: "好友列表" },
  { href: "/requests", label: "好友申请" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-ink">
            Shared Todo Garden
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-ink transition hover:-translate-y-0.5 hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 pb-12">{children}</main>
      </body>
    </html>
  );
}
