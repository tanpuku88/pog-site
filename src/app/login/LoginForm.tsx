"use client";
import { useActionState, useState } from "react";
import { sendLoginEmail, verifyCode, passwordAuth, type LoginState, type PasswordState } from "./actions";

export default function LoginForm({ next, linkError }: { next: string; linkError?: boolean }) {
  const [tab, setTab] = useState<"login" | "signup" | "email">("login");
  const [showLinkError, setShowLinkError] = useState(!!linkError);
  const pick = (t: typeof tab) => (e: React.MouseEvent) => { e.preventDefault(); setTab(t); setShowLinkError(false); };
  return (
    <>
      {showLinkError && <p className="error">メールのリンクからログインできませんでした。リンクの期限切れか、別のブラウザで開いた可能性があります。下からもう一度お試しください。</p>}
      <div className="seg" style={{ marginBottom: 8 }}>
        <a href="#" className={tab === "login" ? "on" : ""} onClick={pick("login")}>ログイン</a>
        <a href="#" className={tab === "signup" ? "on" : ""} onClick={pick("signup")}>新規登録</a>
        <a href="#" className={tab === "email" ? "on" : ""} onClick={pick("email")}>メールのリンクで</a>
      </div>
      {tab === "email" ? <EmailForm next={next} /> : <PasswordForm key={tab} mode={tab} next={next} />}
    </>
  );
}

function PasswordForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const [state, action, pending] = useActionState(passwordAuth, { mode, next } as PasswordState);
  if (state.info) return <p className="ok">{state.info}</p>;
  return (
    <form action={action}>
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && (
        <>
          <label htmlFor="dn">表示名（ランキングに出る名前）</label>
          <input id="dn" name="display_name" maxLength={20} placeholder="例：たんぷく88" />
        </>
      )}
      <label htmlFor="email">メールアドレス</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="pw">パスワード（6文字以上）</label>
      <input id="pw" name="password" type="password" minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
      {state.error && <p className="error">{state.error}</p>}
      <p><button disabled={pending}>{pending ? "確認中…" : mode === "login" ? "ログイン" : "登録してはじめる"}</button></p>
      {mode === "login" && <p className="muted">パスワードを忘れたときや、まだ設定していないときは「メールのリンクで」からログインし、マイページで設定できます。</p>}
    </form>
  );
}

function EmailForm({ next }: { next: string }) {
  const [sent, sendAction, sending] = useActionState(sendLoginEmail, { step: "email", next } as LoginState);
  if (sent.step === "code") return <CodeForm initial={sent} />;
  return (
    <form action={sendAction}>
      <input type="hidden" name="next" value={next} />
      <label htmlFor="email2">メールアドレス</label>
      <input id="email2" name="email" type="email" autoComplete="email" required />
      {sent.error && <p className="error">{sent.error}</p>}
      <p><button disabled={sending}>{sending ? "送信中…" : "ログインメールを送る"}</button></p>
      <p className="muted">届いたメールのリンクは、このページを開いているのと同じブラウザで開いてください。迷惑メールフォルダに入ることがあります。</p>
    </form>
  );
}

function CodeForm({ initial }: { initial: LoginState }) {
  const [state, action, pending] = useActionState(verifyCode, initial);
  return (
    <form action={action}>
      <p className="ok">{initial.email} にメールを送りました。</p>
      <p className="muted">メール内のリンクを開いてください。メールにコードが書かれている場合は、ここに入力してもログインできます。</p>
      <label htmlFor="code">コード</label>
      <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" />
      {state.error && <p className="error">{state.error}</p>}
      <p><button disabled={pending}>{pending ? "確認中…" : "ログイン"}</button></p>
    </form>
  );
}
