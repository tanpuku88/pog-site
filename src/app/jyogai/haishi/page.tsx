import type { Metadata } from "next";
import Link from "next/link";
import { CLOSED_FACILITIES } from "@/content/jyogai";
import { RaceHero } from "@/components/asia/Art";
import { SITE_NAME, SITE_URL } from "@/config/site";

const TITLE = "閉鎖した場外馬券売り場の記録｜ウインズ新橋からテレトラック宮古まで";
const DESC = "役目を終えた場外発売所の記録。サラリーマンの街のウインズ新橋、震災で失われたニュートラックいいたて、津波から復活して閉じたテレトラック宮古、テーマパーク隣接のウインズ佐世保。場外は街の競馬文化そのものだった。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["閉鎖 場外", "ウインズ新橋", "ウインズ銀座通り", "テレトラック宮古", "場外発売所 廃止", "ウインズ佐世保"],
  alternates: { canonical: "/jyogai/haishi" },
  openGraph: { title: TITLE, description: DESC, url: "/jyogai/haishi", type: "website", siteName: SITE_NAME, locale: "ja_JP" },
  twitter: { card: "summary", title: TITLE, description: DESC },
};

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "全国場外馬券売り場ガイド", item: `${SITE_URL}/jyogai` },
      { "@type": "ListItem", position: 3, name: "閉鎖した場外の記録", item: `${SITE_URL}/jyogai/haishi` },
    ],
  },
];

export default function JyogaiHaishi() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
      <p className="crumb"><Link href="/jyogai">全国場外馬券売り場ガイド</Link> ＞ 閉鎖した場外の記録</p>
      <section className="asia-hero">
        <RaceHero className="asia-hero-art" scene="city" sky={["#3b2f2a", "#a0785a", "#efd9b8"]} />
        <div className="asia-hero-text">
          <p className="lead-kicker">LOST OFF-COURSE BETTING</p>
          <h1>閉鎖した場外の記録</h1>
          <p>競馬場と同じように、場外にも歴史がある。街の顔だったウインズ、震災で失われた場外、競馬場の廃止後も残り続けた場外。{CLOSED_FACILITIES.length}施設の記録を、文化として残します。</p>
        </div>
      </section>

      <p className="muted">
        競馬場の記録は<Link href="/keibajo/haishi">なくなった競馬場の記録</Link>にあります。
        ここに載せた施設はすでに営業を終えています。訪問しても馬券は買えません（払戻業務のみ継続している場合があります）。
      </p>

      {CLOSED_FACILITIES.map((c) => (
        <div className="card" key={c.name} style={{ marginBottom: 10 }}>
          <h3 style={{ marginTop: 0 }}>
            {c.name} <span className={`kj-badge ${c.org === "JRA" ? "jra" : "nar"}`}>{c.org}</span>
          </h3>
          <p className="muted" style={{ marginTop: 0 }}>{c.pref}{c.city}｜{c.brand}｜{c.years}</p>
          {c.photos?.[0] && (
            <figure style={{ margin: "0 0 10px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.photos[0].src} alt={c.photos[0].alt} style={{ width: "100%", maxWidth: 560, borderRadius: 8, display: "block" }} loading="lazy" decoding="async" />
              <figcaption className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>
                {c.photos[0].alt}｜{c.photos[0].credit}（{c.photos[0].license}）／<a href={c.photos[0].page} target="_blank" rel="noreferrer">出典ページ</a>
              </figcaption>
            </figure>
          )}
          {c.body.map((p, i) => <p key={i} style={i === c.body.length - 1 ? { marginBottom: 0 } : undefined}>{p}</p>)}
          <p className="muted" style={{ marginBottom: 0, fontSize: 12 }}>出典：<a href={c.source.url} target="_blank" rel="noreferrer">{c.source.label}</a></p>
        </div>
      ))}

      <p><Link href="/jyogai">← 全国場外馬券売り場ガイドに戻る</Link></p>
    </>
  );
}
