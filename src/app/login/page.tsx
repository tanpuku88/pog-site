import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <>
      <h1>ログイン</h1>
      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>
          メールアドレスを入れると、ログイン用のリンクとコードが届きます。パスワードは不要です。
        </p>
        {error && <p className="error">ログインできませんでした。もう一度お試しください。</p>}
        <LoginForm next={next ?? "/"} />
      </div>
    </>
  );
}
