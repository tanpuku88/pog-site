/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { OwnerSiteCards } from "@/components/OwnerSites";
import { SUPERVISOR } from "@/config/site";

export const metadata: Metadata = {
  title: `監修：${SUPERVISOR.name}`,
  description: `POG大会サイトの監修者・${SUPERVISOR.name}のプロフィールと運営サイトの紹介。${SUPERVISOR.catch}`,
  alternates: { canonical: "/supervisor" },
};

export default function Supervisor() {
  return (
    <>
      <p className="crumb"><Link href="/">トップ</Link> › 監修者</p>
      <div className="sv-hero">
        <img src={SUPERVISOR.avatar} alt={`${SUPERVISOR.name}のアイコン`} width={128} height={128} />
        <div>
          <span className="sv-role">{SUPERVISOR.title}</span>
          <h1>{SUPERVISOR.name}</h1>
          <p>{SUPERVISOR.catch}</p>
        </div>
      </div>

      <div className="sec-title"><h2>プロフィール</h2></div>
      <div className="card">
        {SUPERVISOR.bio.map((t, i) => (
          <p key={i} style={{ margin: i === SUPERVISOR.bio.length - 1 ? 0 : "0 0 8px" }}>{t}</p>
        ))}
      </div>

      <div className="sec-title"><h2>監修の方針</h2></div>
      <div className="sv-policy">
        {SUPERVISOR.policy.map((p) => (
          <div className="card" key={p.head}><strong>{p.head}</strong><span className="muted">{p.text}</span></div>
        ))}
      </div>

      <div className="sec-title"><h2>{SUPERVISOR.name}の運営サイト</h2></div>
      <OwnerSiteCards large />

      <div className="cta-band">
        <span><strong>仲間とPOG大会を始めませんか？</strong><br /><span className="muted">大会は無料・招待リンクを送るだけ。</span></span>
        <Link href="/login?mode=signup" className="btn gold">無料で大会を作る</Link>
      </div>
    </>
  );
}
