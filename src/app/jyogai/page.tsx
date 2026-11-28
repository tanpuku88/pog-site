import type { Metadata } from "next";
import { sizedPhoto } from "@/lib/photo-src";
import Link from "next/link";
import { BRANDS, CLOSED_FACILITIES, FACILITIES, JRA_FACILITIES, NAR_FACILITIES, REGIONS } from "@/content/jyogai";
import type { Facility } from "@/content/jyogai";
import { RaceHero } from "@/components/asia/Art";
import { SITE_NAME, SITE_URL } from "@/config/site";

const TITLE = "全国場外馬券売り場ガイド｜ウインズ・Aiba・BAOO・DASHなど全110施設";
const DESC = "JRAのウインズ・エクセル37施設と、地方競馬の場外発売所73施設。所在地・最寄り駅・系列（ブランド）の解説に、周辺の楽しみ、閉鎖した場外の記録まで。場外は街の競馬文化そのものです。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["場外馬券売り場", "ウインズ 一覧", "場外発売所", "Aiba", "BAOO", "DASH", "オフト", "地方競馬 場外", "場外 馬券"],
  alternates: { canonical: "/jyogai" },
  openGraph: { title: TITLE, description: DESC, url: "/jyogai", type: "website", siteName: SITE_NAME, locale: "ja_JP" },
  twitter: { card: "summary", title: TITLE, description: DESC },
};

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "全国場外馬券売り場ガイド", item: `${SITE_URL}/jyogai` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "全国場外馬券売り場ガイド",
    itemListElement: FACILITIES.map((f, i) => ({ "@type": "ListItem", position: i + 1, name: f.name, url: `${SITE_URL}/jyogai/${f.slug}` })),
  },
];

function Card({ f }: { f: Facility }) {
  const ph = f.photos?.[0];
  return (
    <Link href={`/jyogai/${f.slug}`} className={ph ? "asia-country has-photo" : "asia-country"}>
      {ph && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="asia-country-thumb" src={sizedPhoto(ph.src, 640)} alt="" loading="lazy" decoding="async" />
      )}
      <span className={`kj-badge ${f.org === "JRA" ? "jra" : "nar"}`}>{f.org}</span>
      <span>
        <strong>{f.name}</strong>
        <small>{f.pref}｜{f.kind}</small>
        <span className="gt-go">施設を見る →</span>
      </span>
    </Link>
  );
}

export default function JyogaiTop() {
  const prefs = new Set(FACILITIES.map((f) => f.pref)).size;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
      <section className="asia-hero">
        <RaceHero className="asia-hero-art" scene="city" sky={["#173c78", "#5ea4e0", "#d9f0fb"]} />
        <div className="asia-hero-text">
          <p className="lead-kicker">OFF-COURSE BETTING GUIDE</p>
          <h1>全国場外馬券売り場ガイド</h1>
          <p>競馬場がなくても、街には競馬がある。JRAのウインズと地方競馬の場外発売所、全{FACILITIES.length}施設を地域別に紹介します。温泉街のウインズ、道の駅の中の場外、繁華街の最上階の会員制場外——場外はその街の文化です。</p>
        </div>
      </section>

      <nav className="asia-jump" aria-label="ページ内メニュー">
        {REGIONS.map((r) => <a key={r} href={`#${r}`}>{r}</a>)}
        <a href="#brands">系列の解説</a>
        <Link href="/jyogai/haishi">閉鎖した場外の記録</Link>
      </nav>

      <div className="stats">
        <div className="stat"><div className="k">掲載施設</div><div className="v">{FACILITIES.length}<small>施設</small></div><div className="s">JRA {JRA_FACILITIES.length}／地方 {NAR_FACILITIES.length}</div></div>
        <div className="stat"><div className="k">都道府県</div><div className="v">{prefs}<small>都道府県</small></div><div className="s">場外のない県にも競馬ファンはいる</div></div>
        <div className="stat"><div className="k">系列（ブランド）</div><div className="v">{BRANDS.length}<small>系列</small></div><div className="s">ウインズ・Aiba・BAOO・DASH…</div></div>
        <div className="stat"><div className="k">閉鎖した場外の記録</div><div className="v">{CLOSED_FACILITIES.length}<small>施設</small></div><div className="s">文化として残す記録</div></div>
      </div>

      <p className="muted">
        地方競馬の正本は地方競馬公式「場外発売場一覧」、JRAはJRA公式「ウインズ・エクセル一覧」（いずれも2026年11月25日確認）。
        発売する競馬の種類・営業日・営業時間は施設と日によって変わります。行く前に必ず各施設の公式サイトで確認してください。
        競馬場に併設の場外（外向発売所）は<Link href="/keibajo">全国競馬場ガイド</Link>の各競馬場ページで扱っています。
      </p>

      {REGIONS.map((r) => {
        const list = FACILITIES.filter((f) => f.region === r);
        if (list.length === 0) return null;
        return (
          <section key={r} id={r}>
            <div className="sec-title"><h2>{r}の場外（{list.length}施設）</h2></div>
            <div className="asia-countries">
              {list.map((f) => <Card key={f.slug} f={f} />)}
            </div>
          </section>
        );
      })}

      <section id="brands">
        <div className="sec-title"><h2>系列（ブランド）の解説</h2><span className="muted">看板の名前で、どこの競馬が買えるか分かる</span></div>
        {BRANDS.map((b) => (
          <div className="card" key={b.name} style={{ marginBottom: 10 }}>
            <h3 style={{ marginTop: 0 }}>{b.name} <span className={`kj-badge ${b.org === "JRA" ? "jra" : "nar"}`}>{b.org === "共同" ? "共同" : b.org}</span></h3>
            <p style={{ marginBottom: 0 }}>{b.body}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="sec-title"><h2>閉鎖した場外の記録</h2></div>
        <div className="card">
          <p style={{ marginTop: 0 }}>
            ウインズ新橋、震災で失われたニュートラックいいたて、津波から復活して閉じたテレトラック宮古…。
            なくなった場外{CLOSED_FACILITIES.length}施設の記録を、文化として残しています。
          </p>
          <p style={{ marginBottom: 0 }}><Link href="/jyogai/haishi">閉鎖した場外の記録を見る →</Link></p>
        </div>
      </section>
    </>
  );
}
