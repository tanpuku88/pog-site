import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <>
      <h1>ログイン</h1>
      <div className="card">
        <LoginForm next={next ?? "/"} linkError={!!error} />
      </div>
    </>
  );
}
