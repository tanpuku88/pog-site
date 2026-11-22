import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COUNTRIES, findCountry } from "@/content/asia";
import { Flag, FoodIcon, RaceHero, TrackMap } from "@/components/asia/Art";
import type { CountryGuide } from "@/content/asia/types";
import { SITE_NAME, SITE_URL, SUPERVISOR } from "@/config/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ country: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const c = findCountry(country);
  if (!c) return {};
  const title = `${c.name}競馬ガイド｜${c.tracks[0].name}への行き方・馬券の買い方・旅行プラン`;
  const description = seoDescription(c);
  const ph = c.photos?.[0];
  const images = ph ? [{ url: ph.src, alt: ph.alt }] : undefined;
  return {
    title,
    description,
    keywords: [`${c.name} 競馬`, `${c.name} 競馬場`, ...c.tracks.map((t) => t.name), `${c.name} 競馬 旅行`, `${c.name} 競馬 行き方`, `${c.name} 馬券 買い方`],
    alternates: { canonical: `/asia/${c.slug}` },
    openGraph: { title, description, url: `/asia/${c.slug}`, type: "article", siteName: SITE_NAME, locale: "ja_JP", modifiedTime: c.updated, images },
    twitter: { card: ph ? "summary_large_image" : "summary", title, description, images: ph ? [ph.src] : undefined },
  };
}

function seoDescription(c: CountryGuide) {
  const tracks = c.tracks.map((t) => t.name).join("・");
  const access = c.fromJapan?.length ? "東京・広島からの行き方、" : "";
  return `${c.name}の競馬を旅行で楽しむガイド。${c.tagline}。${tracks}への${access}馬券の買い方、モデル旅行プラン、大レース、文化とご当地グルメまで。`.slice(0, 160);
}

const MENU = [
  ["official", "公式サイト"],
  ["tracks", "競馬場"],
  ["howto", "遊び方"],
  ["access", "日本からの行き方"],
  ["plans", "旅行プラン"],
  ["races", "大レース"],
  ["culture", "文化"],
  ["food", "グルメ"],
  ["manners", "注意点"],
] as const;

const MODE: Record<string, string> = { plane: "飛行機", train: "電車", subway: "地下鉄", bus: "バス", taxi: "車", walk: "徒歩", ship: "船" };

const fmtDate = (d: string) => d.replace(/^(\d{4})-(\d{2})-(\d{2})/, (_, y, m, dd) => `${y}年${Number(m)}月${Number(dd)}日`);

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = findCountry(country);
  if (!c) notFound();

  const url = `${SITE_URL}/asia/${c.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "アジア競馬ガイド", item: `${SITE_URL}/asia` },
        { "@type": "ListItem", position: 3, name: `${c.name}競馬ガイド`, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${c.name}競馬ガイド｜行き方・馬券の買い方・旅行プラン`,
      description: seoDescription(c),
      inLanguage: "ja",
      mainEntityOfPage: url,
      dateModified: c.updated,
      image: c.photos?.map((p) => p.src),
      author: { "@type": "Person", name: SUPERVISOR.name, url: `${SITE_URL}/supervisor` },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      about: c.tracks.map((t) => ({ "@type": "Place", name: t.name, alternateName: t.local, address: { "@type": "PostalAddress", addressLocality: t.city, addressCountry: c.flag.toUpperCase() } })),
    },
  ];
  const others = COUNTRIES.filter((o) => o.slug !== c.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="crumb"><Link href="/asia">アジア競馬ガイド</Link> ＞ {c.name}</p>
      <section className="asia-hero">
        <RaceHero className="asia-hero-art" scene={c.scene} sky={c.sky} />
        <div className="asia-hero-text">
          <p className="lead-kicker"><Flag code={c.flag} name={c.name} size={14} /> {c.nameEn.toUpperCase()} RACING GUIDE</p>
          <h1>{c.name}競馬で遊ぼう</h1>
          <p>{c.tagline}</p>
        </div>
      </section>

      <nav className="asia-jump" aria-label="ページ内メニュー">
        {MENU.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <div className="card asia-intro">
        {c.intro.map((p, i) => <p key={i}>{p}</p>)}
        <p className="muted">内容は{fmtDate(c.updated)}時点で公式資料などから確認したものです。</p>
      </div>

      {c.official && c.official.length > 0 && (
        <section id="official" className="asia-official" aria-labelledby="official-title">
          <h2 id="official-title">公式サイト</h2>
          <div className="asia-official-list">
            {c.official.map((o) => (
              <a key={o.url} href={o.url} target="_blank" rel="noopener noreferrer" className="asia-official-card">
                <strong>{o.name}</strong>
                <small>{o.desc}</small>
                <span className="asia-official-url">{o.url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗</span>
              </a>
            ))}
          </div>
          <p className="muted">開催日・入場料・馬券の発売は変わることがあります。出かける前に公式サイトで最新情報を確認してください。</p>
        </section>
      )}

      {c.photos && c.photos.length > 0 && (
        <div className={`asia-photos n${Math.min(c.photos.length, 3)}`}>
          {c.photos.map((ph) => (
            <figure key={ph.src} className="asia-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.src} alt={ph.alt} loading="lazy" decoding="async" />
              <figcaption>
                {ph.alt}
                <span>写真：<a href={ph.page} target="_blank" rel="noopener noreferrer">{ph.credit}</a>（{ph.license}／Wikimedia Commons）</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="stats">
        {c.quickFacts.map((f) => (
          <div key={f.k} className="stat"><div className="k">{f.k}</div><div className="v">{f.v}</div>{f.s && <div className="s">{f.s}</div>}</div>
        ))}
      </div>

      <div className="sec-title" id="tracks"><h2>競馬場</h2></div>
      <div className={c.showMap ? "asia-tracks" : "asia-tracks no-map"}>
        {c.showMap && <div className="card asia-map-card"><TrackMap tracks={c.tracks} /></div>}
        <div className="asia-track-list">
          {c.tracks.map((t) => (
            <article key={t.name} className="card asia-track" style={{ borderLeftColor: t.color }}>
              <h3>{t.name} <small>{t.local}</small></h3>
              <p className="asia-track-meta"><span className="pill">{t.days}</span> {t.city}</p>
              <p>{t.feature}</p>
              <dl>
                <dt>行き方</dt><dd><ul>{t.access.map((a) => <li key={a}>{a}</li>)}</ul></dd>
                <dt>入場</dt><dd>{t.admission}</dd>
                <dt>近くの見どころ</dt><dd>{t.nearby.join("・")}</dd>
              </dl>
            </article>
          ))}
        </div>
      </div>

      <div className="sec-title" id="howto"><h2>{c.name}競馬の遊び方 5ステップ</h2></div>
      <ol className="steps">
        {c.howTo.map((s) => <li key={s.title}><strong>{s.title}</strong>{s.body}</li>)}
      </ol>

      <div className="card flush">
        <table className="list asia-terms">
          <caption>{c.termsTitle ?? "馬券の言葉（指さしで使えます）"}</caption>
          <thead><tr><th>日本</th><th>現地</th><th>読み</th><th className="hide-sm">意味</th></tr></thead>
          <tbody>
            {c.terms.map((t) => (
              <tr key={t.jp}><td><b>{t.jp}</b></td><td className="asia-local">{t.local}</td><td>{t.read}</td><td className="hide-sm muted">{t.note ?? ""}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {c.fromJapan && c.fromJapan.length > 0 && (
        <>
          <div className="sec-title" id="access"><h2>日本からの行き方（東京・広島）</h2></div>
          <p className="asia-note">ここに書いた時刻・便名は<b>2026年11月時点の時刻表をもとにした例</b>です。便は曜日や季節で変わるので、出発前にかならず下の公式時刻表で確認してください。</p>
          <div className="asia-routes">
            {c.fromJapan.map((r) => (
              <article key={r.title} className={`card asia-route from-${r.from === "東京" ? "tokyo" : "hiroshima"}`}>
                <p className="asia-route-from">{r.from}から</p>
                <h3>{r.title}</h3>
                <p className="muted">{r.summary}</p>
                <ol className="asia-route-steps">
                  {r.steps.map((st, i) => (
                    <li key={i}>
                      <span className={`asia-mode m-${st.mode}`}>{MODE[st.mode]}</span>
                      <div>{st.time && <time>{st.time}</time>}<span>{st.text}</span></div>
                    </li>
                  ))}
                </ol>
                {r.links && (
                  <p className="asia-route-links">公式の時刻表：{r.links.map((l, i) => <span key={l.url}>{i > 0 && "／"}<a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></span>)}</p>
                )}
              </article>
            ))}
          </div>
        </>
      )}

      <div className="sec-title" id="plans"><h2>モデル旅行プラン</h2></div>
      <div className="asia-plans">
        {c.plans.map((p) => (
          <details key={p.id} className="card asia-plan" open={p.id === c.plans[0].id}>
            <summary>
              <span className="asia-plan-nights">{p.nights}</span>
              <strong>{p.title}</strong>
              <small>{p.catch}</small>
            </summary>
            <p className="muted">おすすめ：{p.best}</p>
            {p.days.map((d) => (
              <div key={d.label} className="asia-day">
                <h4>{d.label}</h4>
                <ul className="asia-timeline">
                  {d.items.map((it, i) => <li key={i}><time>{it.time}</time><span>{it.text}</span></li>)}
                </ul>
              </div>
            ))}
            <ul className="asia-tips">{p.tips.map((t) => <li key={t}>{t}</li>)}</ul>
          </details>
        ))}
      </div>

      <div className="sec-title" id="races"><h2>知っておきたい大レース</h2></div>
      <div className="features">
        {c.bigRaces.map((r) => (
          <div key={r.name} className="card asia-race">
            <strong>{r.name}</strong>
            <p className="muted" style={{ margin: "0 0 4px" }}>{r.when}｜{r.where}</p>
            <p style={{ margin: 0 }}>{r.body}</p>
          </div>
        ))}
      </div>
      <div className="cta-band asia-pog">
        <div>
          <strong>POG好きのための{c.name}競馬</strong>
          <ul>{c.pogCorner.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      </div>

      <div className="sec-title" id="culture"><h2>競馬と文化</h2></div>
      <div className="features">
        {c.culture.map((x) => (
          <div key={x.title} className="card"><strong>{x.title}</strong><p style={{ margin: 0 }}>{x.body}</p></div>
        ))}
      </div>

      <div className="sec-title" id="food"><h2>競馬のあとに食べたい ご当地グルメ</h2></div>
      <div className="asia-foods">
        {c.foods.map((f) => (
          <div key={f.name} className="card asia-food">
            <FoodIcon kind={f.icon} />
            <div>
              <strong>{f.name}</strong> <span className="asia-local muted">{f.local}</span>
              <p className="asia-food-where">{f.where}</p>
              <p>{f.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sec-title" id="manners"><h2>マナーと注意点</h2></div>
      <div className="card">
        <ul className="asia-check">{c.manners.map((m) => <li key={m}>{m}</li>)}</ul>
      </div>

      <div className="sec-title"><h2>出典・参考（確認日）</h2></div>
      <div className="card asia-sources">
        <ul>
          {c.sources.map((s) => (
            <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a> <span className="muted">（{s.date}）</span></li>
          ))}
        </ul>
        <p className="muted" style={{ marginBottom: 0 }}>イラストはこのサイトのオリジナルです。写真はWikimedia Commonsのフリーライセンス写真で、撮影者とライセンスを各写真の下に載せています。料金・時間は目安で、変わることがあります。馬券は無理のない範囲で楽しみましょう。</p>
      </div>

      <div className="sec-title"><h2>ほかの国の競馬ガイド</h2></div>
      <nav className="asia-others" aria-label="ほかの国の競馬ガイド">
        {others.map((o) => (
          <Link key={o.slug} href={`/asia/${o.slug}`}><Flag code={o.flag} name={o.name} size={14} /> {o.name}の競馬</Link>
        ))}
      </nav>
      <p style={{ textAlign: "center", marginTop: 24 }}><Link href="/asia" className="btn">アジア競馬ガイドのトップへ</Link></p>
    </>
  );
}
