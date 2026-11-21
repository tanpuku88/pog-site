import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import { loadInvite } from "@/lib/invite";
import { safeNext } from "@/lib/util";

export const metadata: Metadata = { title: "ログイン・新規登録", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; mode?: string }> }) {
  const { next: rawNext, error, mode } = await searchParams;
  const next = safeNext(rawNext);
  const code = next.match(/^\/join\/([^/?#]+)/)?.[1];
  const invite = code ? await loadInvite(decodeURIComponent(code)) : null;
  return (
    <>
      <h1>{mode === "signup" ? "新規登録" : "ログイン"}</h1>
      {invite && (
        <div className="card" style={{ borderLeft: "4px solid var(--gold)" }}>
          <strong>POG大会「{invite.name}」に参加します</strong>
          <div className="muted">登録またはログインが終わると、そのまま大会に入れます。</div>
        </div>
      )}
      <div className="card">
        <LoginForm next={next} linkError={!!error} initialTab={mode === "signup" ? "signup" : "login"} />
      </div>
    </>
  );
}
