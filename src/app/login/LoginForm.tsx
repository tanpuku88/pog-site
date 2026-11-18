"use client";
import { useActionState } from "react";
import { sendLoginEmail, verifyCode, type LoginState } from "./actions";

export default function LoginForm({ next }: { next: string }) {
  const [sent, sendAction, sending] = useActionState(sendLoginEmail, { step: "email", next } as LoginState);
  if (sent.step === "code") return <CodeForm initial={sent} />;
  return (
    <form action={sendAction}>
      <input type="hidden" name="next" value={next} />
      <label htmlFor="email">メールアドレス</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      {sent.error && <p className="error">{sent.error}</p>}
      <p><button disabled={sending}>{sending ? "送信中…" : "ログインメールを送る"}</button></p>
    </form>
  );
}

function CodeForm({ initial }: { initial: LoginState }) {
  const [state, action, pending] = useActionState(verifyCode, initial);
  return (
    <form action={action}>
      <p className="ok">{initial.email} にメールを送りました。</p>
      <p className="muted">メール内のリンクを開くか、メールに書かれたコードを入力してください。</p>
      <label htmlFor="code">コード</label>
      <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" />
      {state.error && <p className="error">{state.error}</p>}
      <p><button disabled={pending}>{pending ? "確認中…" : "ログイン"}</button></p>
    </form>
  );
}
