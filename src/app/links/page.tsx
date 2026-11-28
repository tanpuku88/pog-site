import type { Metadata } from "next";
import Link from "next/link";
import { RECOMMENDED_SITES } from "@/content/links";

export const metadata: Metadata = {
  title: "おすすめサイト",
  description: "POG大会サイトがおすすめする競馬サイトのリンク集。総合情報サイト、血統・データ分析、競馬ラジオなど、指名馬選びや週末の競馬がもっと楽しくなるサイトを紹介します。",
  alternates: { canonical: "/links" },
};

export default function Links() {
  return (
    <>
      <p className="crumb"><Link href="/">トップ</Link> › おすすめサイト</p>
      <h1>おすすめサイト</h1>
      <p className="muted">
        POGの指名馬選びや週末の競馬がもっと楽しくなる、監修者おすすめのサイトです。
      </p>

      <div className="sv-policy">
        {RECOMMENDED_SITES.map((s) => (
          <div className="card" key={s.url}>
            <span className="kj-badge nar">{s.label}</span>
            <strong style={{ display: "block", margin: "6px 0 4px" }}>
              <a href={s.url} target="_blank" rel="noreferrer">{s.name} ↗</a>
            </strong>
            <span className="muted">{s.desc}</span>
          </div>
        ))}
      </div>

      <div className="sec-title"><h2>相互リンクについて</h2></div>
      <div className="card">
        <p style={{ margin: 0 }}>
          競馬関連サイトとの相互リンクは随時受け付けています。ご希望の方は、監修者ページの連絡先からお声がけください。
        </p>
      </div>
    </>
  );
}
