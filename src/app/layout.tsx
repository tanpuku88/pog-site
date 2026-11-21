import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getUser } from "@/lib/supabase/server";
import { GOOGLE_SITE_VERIFICATION, SITE_NAME, SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "POG（ペーパーオーナーゲーム）大会を無料で開ける｜指名・成績を自動集計", template: "%s | POG" },
  description: "POG大会を無料で作れるサイト。招待リンクで仲間を呼び、馬名を数文字入れるだけで指名。2歳馬の血統・成績・指名数、種牡馬ランキング、新馬戦情報も。",
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, locale: "ja_JP", type: "website" },
  twitter: { card: "summary" },
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
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
              <Link href="/shinba">新馬戦</Link>
              <Link href="/sires">種牡馬</Link>
              <Link href="/horses" className="hide-sm">馬を探す</Link>
              {user ? (
                <>
                  <Link href="/" className="hide-sm">グループ</Link>
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
