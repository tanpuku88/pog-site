import type { Metadata } from "next";
import Link from "next/link";
import { COUNTRIES, COMING_SOON } from "@/content/asia";
import { Flag, RaceHero } from "@/components/asia/Art";

export const metadata: Metadata = {
  title: "アジア競馬ガイド｜旅行プラン・馬券の買い方・競馬場グルメ",
  description: "韓国など、アジアの競馬を旅行で楽しむためのガイド。競馬場への行き方、馬券の買い方、モデルプラン、文化や地元グルメまで。",
  alternates: { canonical: "/asia" },
};

export default function AsiaTop() {
  return (
    <>
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
      <p className="muted">イラストはこのサイトのオリジナル、国旗の画像は flag-icons（MITライセンス）、写真は Wikimedia Commons のフリーライセンス写真（撮影者とライセンスは各国のページに記載）を使っています。開催日や料金は変わることがあるので、出かける前に各国の公式サイトも確認してください。</p>
    </>
  );
}
