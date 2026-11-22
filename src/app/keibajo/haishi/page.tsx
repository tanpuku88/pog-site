import type { Metadata } from "next";
import Link from "next/link";
import { LOST_BRIEF, LOST_TRACKS } from "@/content/keibajo/lost";
import { RaceHero } from "@/components/asia/Art";
import { SITE_NAME, SITE_URL } from "@/config/site";

const TITLE = "なくなった競馬場の記録｜目黒・根岸から福山・荒尾まで";
const DESC = "日本ダービーが生まれた目黒競馬場、日本初の洋式競馬の根岸競馬場、そして2000年代に姿を消した中津・足利・高崎・宇都宮・荒尾・福山などの地方競馬場。歴史・名馬・跡地の今と訪ね方を記録します。";

const OG = LOST_TRACKS.find((t) => t.slug === "meguro")?.photos?.[0];

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["廃止 競馬場", "なくなった競馬場", "競馬場 跡地", "目黒競馬場", "根岸競馬場", "福山競馬場", "荒尾競馬場", "高崎競馬場", "宇都宮競馬場"],
  alternates: { canonical: "/keibajo/haishi" },
  openGraph: { title: TITLE, description: DESC, url: "/keibajo/haishi", type: "website", siteName: SITE_NAME, locale: "ja_JP", images: OG ? [{ url: OG.src, alt: OG.alt }] : undefined },
  twitter: { card: OG ? "summary_large_image" : "summary", title: TITLE, description: DESC, images: OG ? [OG.src] : undefined },
};

const SORTED = [...LOST_TRACKS].sort((a, b) => a.closedYear - b.closedYear);

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "全国競馬場ガイド", item: `${SITE_URL}/keibajo` },
      { "@type": "ListItem", position: 3, name: "なくなった競馬場の記録", item: `${SITE_URL}/keibajo/haishi` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "なくなった競馬場の記録",
    itemListElement: SORTED.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `${SITE_URL}/keibajo/haishi/${t.slug}` })),
  },
];

export default function LostTop() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
      <p className="crumb"><Link href="/keibajo">全国競馬場ガイド</Link> ＞ なくなった競馬場の記録</p>
      <section className="asia-hero">
        <RaceHero className="asia-hero-art" scene="city" sky={["#3b2f2a", "#a0785a", "#efd9b8"]} />
        <div className="asia-hero-text">
          <p className="lead-kicker">LOST RACECOURSES OF JAPAN</p>
          <h1>なくなった競馬場の記録</h1>
          <p>いまはもうない競馬場にも、名馬と人の物語がありました。歴史・名馬・跡地の今と、訪ね方を残します。</p>
        </div>
      </section>

      <div className="card asia-intro">
        <p>日本の競馬は、幕末の横浜・根岸から始まりました。日本ダービーは目黒で生まれ、戦後は全国に地方競馬場ができました。</p>
        <p>日本ダービーが初めて行われた1932年の写真や、明治の根岸競馬場の絵など、自由に使える昔の写真も各ページに載せています。</p>
        <p>2001年の中津から2013年の福山まで、地方競馬場は次々と姿を消しました。それでも跡地の道の形や記念碑、駅の像などに、いまも名残が見つかります。</p>
        <p className="muted">内容は2026年11月22日に、Wikipediaの各記事と自治体の公式ページで確認したものです。確認できなかったことは「確認できていません」と書いています。</p>
      </div>

      <div className="sec-title"><h2>年表：なくなった順</h2></div>
      <div className="card">
        <ul className="asia-timeline">
          {SORTED.map((t) => (
            <li key={t.slug}><time>{t.closedYear}年</time><span><Link href={`/keibajo/haishi/${t.slug}`}><b>{t.name}</b></Link>（{t.pref}）　{t.tagline}</span></li>
          ))}
        </ul>
      </div>

      <div className="sec-title"><h2>競馬場ごとの記録</h2></div>
      <div className="asia-countries">
        {SORTED.map((t) => (
          <Link key={t.slug} href={`/keibajo/haishi/${t.slug}`} className={t.photos?.length ? "asia-country has-photo" : "asia-country"}>
            {t.photos?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="asia-country-thumb" src={t.photos[0].src} alt="" loading="lazy" decoding="async" />
            )}
            <span className="kj-badge lost">{t.closedYear}</span>
            <span>
              <strong>{t.name}</strong>
              <small>{t.pref}｜{t.kind}｜{t.tagline}</small>
              <span className="gt-go">記録を見る →</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="sec-title"><h2>そのほかの、なくなった競馬場（戦後〜）</h2></div>
      <div className="card flush">
        <table className="list kj-compare">
          <thead><tr><th>競馬場</th><th>場所</th><th>廃止</th><th>跡地の今</th></tr></thead>
          <tbody>
            {LOST_BRIEF.map((b) => (
              <tr key={b.name}><td><b>{b.name}</b></td><td>{b.pref}</td><td>{b.closed}</td><td>{b.now}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">
        出典：<a href="https://ja.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E3%81%AE%E5%BB%83%E6%AD%A2%E3%83%BB%E4%BC%91%E6%AD%A2%E7%AB%B6%E9%A6%AC%E5%A0%B4%E4%B8%80%E8%A6%A7" target="_blank" rel="noopener noreferrer">Wikipedia「日本の廃止・休止競馬場一覧」</a>（2026年11月22日確認）。
        戦後すぐの1950年代には、ほかにも多くの競馬場が廃止されています。
      </p>
      <p style={{ textAlign: "center", marginTop: 16 }}><Link href="/keibajo" className="btn">いまある競馬場のガイドへ</Link></p>
    </>
  );
}
