import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "POG",
  description: "指名馬の登録と成績集計がラクなPOGサイト",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getUser();
  return (
    <html lang="ja">
      <body>
        <header className="topbar">
          <div className="topbar-in">
            <Link href="/" className="logo">🏇 POG<small>ペーパーオーナーゲーム</small></Link>
            <nav>
              {user ? (
                <>
                  <Link href="/">グループ</Link>
                  <Link href="/me">マイページ</Link>
                  <form action="/auth/signout" method="post"><button>ログアウト</button></form>
                </>
              ) : (
                <Link href="/login">ログイン</Link>
              )}
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
