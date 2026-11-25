import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import GlobalNav from "@/components/GlobalNav";
import { getUser } from "@/lib/supabase/server";
import { GOOGLE_SITE_VERIFICATION, OWNER_SITES, SITE_NAME, SITE_URL, SUPERVISOR } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "POG（ペーパーオーナーゲーム）大会を無料で開ける｜指名・成績を自動集計", template: "%s | POG" },
  description: "POG大会を無料で作れるサイト。招待リンクで仲間を呼び、馬名を数文字入れるだけで指名。2歳馬の血統・成績・指名数、種牡馬ランキング、新馬戦情報も。",
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, locale: "ja_JP", type: "website" },
  twitter: { card: "summary_large_image" },
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getUser();
  return (
    <html lang="ja">
      <body>
        <header className="topbar">
          <div className="topbar-in">
            <Link href="/" className="logo">{/* eslint-disable-next-line @next/next/no-img-element */}<img className="logo-mark" src="/brand/pog88.png" alt="" width={30} height={30} />POG<small>ペーパーオーナーゲーム</small></Link>
            <nav className="account">
              {user ? (
                <>
                  <Link href="/me">マイページ</Link>
                  <form action="/auth/signout" method="post"><button>ログアウト</button></form>
                </>
              ) : (
                <>
                  <Link href="/login">ログイン</Link>
                  <Link href="/login?mode=signup" className="signup">無料登録</Link>
                </>
              )}
            </nav>
          </div>
          <GlobalNav />
        </header>
        <main className="wrap">{children}</main>
        <footer className="footer">
          <div className="footer-in">
            <nav>
              <Link href="/popular">注目馬30傑</Link>
              <Link href="/shinba">新馬戦</Link>
              <Link href="/data">POGデータ</Link>
              <Link href="/sires">種牡馬</Link>
              <Link href="/trainers">厩舎</Link>
              <Link href="/owners">馬主</Link>
              <Link href="/breeders">生産牧場</Link>
              <Link href="/horses">馬を探す</Link>
              <Link href="/keibajo">全国競馬場ガイド</Link>
              <Link href="/jyogai">全国場外馬券売り場ガイド</Link>
              <Link href="/asia">アジア競馬ガイド</Link>
              <Link href="/guide">使い方</Link>
            </nav>
            <div className="footer-sv">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Link href="/supervisor"><img src={SUPERVISOR.avatar} alt="" width={24} height={24} />監修：{SUPERVISOR.name}</Link>
              {OWNER_SITES.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.name} ↗</a>
              ))}
            </div>
            <p>成績データは毎晩自動で更新しています。賞金は中央競馬の本賞金（万円）です。</p>
            <p className="copy">© {SITE_NAME}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
