import type { Metadata } from "next";
import { sizedPhoto } from "@/lib/photo-src";
import Link from "next/link";
import { REGIONS, TRACKS } from "@/content/keibajo";
import type { RaceTrack } from "@/content/keibajo/types";
import { RaceHero } from "@/components/asia/Art";
import { SITE_NAME, SITE_URL } from "@/config/site";

const JRA = TRACKS.filter((t) => t.org === "JRA");
const NAR = TRACKS.filter((t) => t.org === "NAR");

const TITLE = "全国競馬場ガイド｜中央10場・地方15場の行き方・コース・グルメ";
const DESC = "JRAの10競馬場と地方競馬15場を、東京・広島からの行き方、入場料、コースの特徴、大レース、POGの見どころ、ご当地グルメ、モデル旅行プランまで1ページずつ紹介。";
const OG = TRACKS[0].photos?.[0];

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["競馬場 ガイド", "競馬場 行き方", "JRA 競馬場 一覧", "地方競馬 競馬場 一覧", "競馬場 コース 特徴", "競馬場 グルメ", "競馬 旅行"],
  alternates: { canonical: "/keibajo" },
  openGraph: { title: TITLE, description: DESC, url: "/keibajo", type: "website", siteName: SITE_NAME, locale: "ja_JP", images: OG ? [{ url: OG.src, alt: OG.alt }] : undefined },
  twitter: { card: OG ? "summary_large_image" : "summary", title: TITLE, description: DESC, images: OG ? [OG.src] : undefined },
};

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "全国競馬場ガイド", item: `${SITE_URL}/keibajo` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "全国競馬場ガイド",
    itemListElement: TRACKS.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: `${t.name}ガイド`, url: `${SITE_URL}/keibajo/${t.slug}` })),
  },
];

function Card({ t }: { t: RaceTrack }) {
  const ph = t.photos?.[0];
  return (
    <Link href={`/keibajo/${t.slug}`} className={ph ? "asia-country has-photo" : "asia-country"}>
      {ph && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="asia-country-thumb" src={sizedPhoto(ph.src, 640)} alt="" loading="lazy" decoding="async" />
      )}
      <span className={`kj-badge ${t.org === "JRA" ? "jra" : "nar"}`}>{t.short}</span>
      <span>
        <strong>{t.name}</strong>
        <small>{t.pref}｜{t.tagline}</small>
        <span className="gt-go">ガイドを見る →</span>
      </span>
    </Link>
  );
}

/** 直線の長さ（「525.9m」「486m（ゴールまで…）」）を数字にする。比べられないものは0 */
const num = (s?: string) => Number((s ?? "").replace(/,/g, "").match(/[\d.]+/)?.[0] ?? 0);

export default function KeibajoTop() {
  const rows = TRACKS.flatMap((t) => t.courses.filter((c) => c.turn !== "直線").slice(0, 3).map((c) => ({ t, c })));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
      <section className="asia-hero">
        <RaceHero className="asia-hero-art" scene="mountain" sky={["#173c78", "#5ea4e0", "#d9f0fb"]} />
        <div className="asia-hero-text">
          <p className="lead-kicker">JAPAN RACECOURSE GUIDE</p>
          <h1>全国競馬場ガイド</h1>
          <p>中央競馬（JRA）の10場と、地方競馬の15場。行き方・コースの特徴・大レース・POGの見どころ・ご当地グルメまで、1場ずつ紹介します。</p>
        </div>
      </section>

      <nav className="asia-jump" aria-label="ページ内メニュー">
        <a href="#jra">中央競馬（JRA）</a>
        <a href="#nar">地方競馬</a>
        <a href="#compare">コース比較表</a>
        <Link href="/keibajo/haishi">なくなった競馬場</Link>
      </nav>

      <div className="sec-title" id="jra"><h2>中央競馬（JRA）10場</h2></div>
      <div className="asia-countries">{JRA.map((t) => <Card key={t.slug} t={t} />)}</div>

      <div className="sec-title" id="nar"><h2>地方競馬 15場</h2></div>
      {REGIONS.map((r) => {
        const list = NAR.filter((t) => t.region === r);
        if (!list.length) return null;
        return (
          <section key={r}>
            <h3 className="kj-region">{r}</h3>
            <div className="asia-countries">{list.map((t) => <Card key={t.slug} t={t} />)}</div>
          </section>
        );
      })}
      <div className="cta-band asia-pog">
        <div>
          <strong>南関東4場（浦和・船橋・大井・川崎）をもっとくわしく</strong>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>監修者が運営する <a href="https://nankan-course-9899.web.app" target="_blank" rel="noopener noreferrer">南関競馬データ攻略</a> で、南関東の全コースの傾向を集計しています。</p>
        </div>
      </div>

      <div className="sec-title" id="compare"><h2>コース比較表（直線の長い順）</h2></div>
      <div className="card flush">
        <table className="list kj-compare">
          <thead><tr><th>競馬場</th><th>コース</th><th>回り</th><th className="hide-sm">1周</th><th>最後の直線</th></tr></thead>
          <tbody>
            {[...rows].sort((a, b) => num(b.c.straight) - num(a.c.straight)).map(({ t, c }) => (
              <tr key={t.slug + c.name}>
                <td><Link href={`/keibajo/${t.slug}`}><b>{t.short}</b></Link> <span className={`kj-mini ${t.org === "JRA" ? "jra" : "nar"}`}>{t.org === "JRA" ? "中央" : "地方"}</span></td>
                <td>{c.name}</td>
                <td>{c.turn}</td>
                <td className="hide-sm">{c.lap}</td>
                <td>{c.straight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">数字はJRA公式サイト・地方競馬情報サイトのコース紹介（2026年11月22日確認）から。地方競馬の直線は「4コーナー出口から」の長さで、（　）内はゴールまでの長さです。写真はWikimedia Commonsのフリーライセンス写真（撮影者とライセンスは各ページに記載）。開催日や料金は変わることがあるので、出かける前に公式サイトも確認してください。</p>
      <div className="cta-band asia-pog">
        <div>
          <strong>なくなった競馬場の記録</strong>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>日本ダービーが生まれた目黒、日本初の洋式競馬の根岸、そして福山・荒尾・高崎・宇都宮など。歴史・名馬・跡地の今を残しています。 <Link href="/keibajo/haishi">記録を見る →</Link></p>
        </div>
      </div>
      <p style={{ textAlign: "center", marginTop: 16 }}><Link href="/asia" className="btn">アジア競馬ガイドも見る</Link></p>
    </>
  );
}
