import type { Metadata } from "next";
import Link from "next/link";
import { COUNTRIES, COMING_SOON } from "@/content/asia";
import { CLOSED } from "@/content/asia/closed";
import { Flag, RaceHero } from "@/components/asia/Art";
import { SITE_NAME, SITE_URL } from "@/config/site";

const TITLE = `アジア競馬ガイド｜韓国・香港・モンゴル・ドバイなど${COUNTRIES.length}か国の競馬と旅行プラン`;
const DESC = `${COUNTRIES.slice(0, 8).map((c) => c.name).join("・")}など${COUNTRIES.length}か国の競馬を旅行で楽しむガイド。東京・広島からの行き方、馬券の買い方、モデル旅行プラン、大レース、ご当地グルメまで。`;
const OG = COUNTRIES[0].photos?.[0];

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["アジア 競馬", "海外競馬 旅行", "韓国 競馬", "香港 競馬", "ドバイ 競馬", "海外 競馬場 行き方"],
  alternates: { canonical: "/asia" },
  openGraph: { title: TITLE, description: DESC, url: "/asia", type: "website", siteName: SITE_NAME, locale: "ja_JP", images: OG ? [{ url: OG.src, alt: OG.alt }] : undefined },
  twitter: { card: OG ? "summary_large_image" : "summary", title: TITLE, description: DESC, images: OG ? [OG.src] : undefined },
};

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "アジア競馬ガイド", item: `${SITE_URL}/asia` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "アジア競馬ガイド",
    itemListElement: COUNTRIES.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: `${c.name}競馬ガイド`, url: `${SITE_URL}/asia/${c.slug}` })),
  },
];

export default function AsiaTop() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
      <section className="asia-hero">
        <RaceHero className="asia-hero-art" />
        <div className="asia-hero-text">
          <p className="lead-kicker">ASIA RACING GUIDE</p>
          <h1>アジア競馬ガイド</h1>
          <p>日本から近い国の競馬場へ、旅行がてら遊びに行こう。行き方・馬券の買い方・モデルプラン・ごはんまで、まとめて紹介します。</p>
        </div>
      </section>

      <div className="sec-title"><h2>国をえらぶ</h2></div>
      <div className="asia-countries">
        {COUNTRIES.map((c) => (
          <Link key={c.slug} href={`/asia/${c.slug}`} className={c.photos?.[0] ? "asia-country has-photo" : "asia-country"}>
            {c.photos?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="asia-country-thumb" src={c.photos[0].src} alt="" loading="lazy" decoding="async" />
            )}
            <span className="asia-flag"><Flag code={c.flag} name={c.name} /></span>
            <span>
              <strong>{c.name}の競馬</strong>
              <small>{c.tagline}</small>
              <span className="gt-go">ガイドを見る →</span>
            </span>
          </Link>
        ))}
        {COMING_SOON.map((c) => (
          <div key={c.slug} className="asia-country soon">
            <span className="asia-flag"><Flag code={c.flag} name={c.name} /></span>
            <span>
              <strong>{c.name} <span className="pill">準備中</span></strong>
              <small>{c.note}</small>
            </span>
          </div>
        ))}
      </div>

      <div className="sec-title" id="closed"><h2>コラム：閉場したアジアの競馬場</h2></div>
      <p>アジアでは、ここ数年で歴史ある競馬場がいくつも幕を下ろしました。旅先で跡地を訪ねるときの参考に、記録を残しておきます。</p>
      <div className="asia-closed">
        {CLOSED.map((t) => (
          <article key={t.name} className="card asia-closed-card">
            {t.photo && (
              <figure className="asia-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="ph-box"><img src={t.photo.src} alt={t.photo.alt} loading="lazy" decoding="async" /></span>
                <figcaption>{t.photo.alt}<span>写真：<a href={t.photo.page} target="_blank" rel="noopener noreferrer">{t.photo.credit}</a>（{t.photo.license}／Wikimedia Commons）</span></figcaption>
              </figure>
            )}
            <h3><Flag code={t.flag} name={t.name} size={14} /> {t.name}</h3>
            <p className="pill">{t.years}</p>
            {t.body.map((b) => <p key={b}>{b}</p>)}
            <p className="muted" style={{ fontSize: 12 }}>出典：<a href={t.source.url} target="_blank" rel="noopener noreferrer">{t.source.label}</a>（2026年11月22日確認）</p>
          </article>
        ))}
      </div>

      <p className="muted">イラストはこのサイトのオリジナル、国旗の画像は flag-icons（MITライセンス）、写真は Wikimedia Commons のフリーライセンス写真（撮影者とライセンスは各国のページに記載）を使っています。開催日や料金は変わることがあるので、出かける前に各国の公式サイトも確認してください。</p>
    </>
  );
}
