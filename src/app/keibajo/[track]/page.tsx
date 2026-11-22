import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRACKS, findTrack } from "@/content/keibajo";
import { COMMON_MANNERS, JRA_HOWTO, NAR_HOWTO } from "@/content/keibajo/common";
import type { RaceTrack } from "@/content/keibajo/types";
import { FoodIcon, RaceHero } from "@/components/asia/Art";
import { SITE_NAME, SITE_URL, SUPERVISOR } from "@/config/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.slug }));
}

function seoDescription(t: RaceTrack) {
  const races = t.bigRaces.slice(0, 2).map((r) => r.name.replace(/（.*?）/g, "")).join("・");
  return `${t.name}（${t.pref}）のガイド。${t.tagline}。東京・広島からの行き方、入場料、コースの特徴、${races}など大レース、POGの見どころ、ご当地グルメとモデルプラン。`.slice(0, 160);
}

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }): Promise<Metadata> {
  const { track } = await params;
  const t = findTrack(track);
  if (!t) return {};
  const title = `${t.name}ガイド｜行き方・コースの特徴・グルメ・旅行プラン`;
  const description = seoDescription(t);
  const ph = t.photos?.[0];
  return {
    title,
    description,
    keywords: [t.name, `${t.name} 行き方`, `${t.name} コース 特徴`, `${t.name} グルメ`, `${t.name} 入場料`, `${t.short}競馬`],
    alternates: { canonical: `/keibajo/${t.slug}` },
    openGraph: { title, description, url: `/keibajo/${t.slug}`, type: "article", siteName: SITE_NAME, locale: "ja_JP", modifiedTime: t.updated, images: ph ? [{ url: ph.src, alt: ph.alt }] : undefined },
    twitter: { card: ph ? "summary_large_image" : "summary", title, description, images: ph ? [ph.src] : undefined },
  };
}

const MENU = [
  ["info", "基本情報"],
  ["course", "コース"],
  ["access", "行き方"],
  ["howto", "遊び方"],
  ["races", "大レース"],
  ["pog", "POG"],
  ["food", "グルメ"],
  ["plan", "旅行プラン"],
  ["manners", "注意点"],
] as const;

const MODE: Record<string, string> = { plane: "飛行機", train: "電車", subway: "地下鉄", bus: "バス", taxi: "車", walk: "徒歩", ship: "船" };
const fmtDate = (d: string) => d.replace(/^(\d{4})-(\d{2})-(\d{2})/, (_, y, m, dd) => `${y}年${Number(m)}月${Number(dd)}日`);

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  const t = findTrack(track);
  if (!t) notFound();

  const url = `${SITE_URL}/keibajo/${t.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "全国競馬場ガイド", item: `${SITE_URL}/keibajo` },
        { "@type": "ListItem", position: 3, name: `${t.name}ガイド`, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${t.name}ガイド｜行き方・コースの特徴・グルメ・旅行プラン`,
      description: seoDescription(t),
      inLanguage: "ja",
      mainEntityOfPage: url,
      dateModified: t.updated,
      image: t.photos?.map((p) => p.src),
      author: { "@type": "Person", name: SUPERVISOR.name, url: `${SITE_URL}/supervisor` },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      about: { "@type": "Place", name: t.name, address: { "@type": "PostalAddress", streetAddress: t.address, addressRegion: t.pref, addressCountry: "JP" } },
    },
  ];
  const howto = t.org === "JRA" ? JRA_HOWTO : NAR_HOWTO;
  const same = TRACKS.filter((o) => o.org === t.org && o.slug !== t.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="crumb"><Link href="/keibajo">全国競馬場ガイド</Link> ＞ {t.name}</p>
      <section className="asia-hero">
        <RaceHero className="asia-hero-art" scene={t.scene} sky={t.sky} />
        <div className="asia-hero-text">
          <p className="lead-kicker"><span className={`kj-mini ${t.org === "JRA" ? "jra" : "nar"}`}>{t.org === "JRA" ? "中央競馬" : "地方競馬"}</span> {t.en.toUpperCase()} RACECOURSE</p>
          <h1>{t.name}</h1>
          <p>{t.tagline}</p>
        </div>
      </section>

      <nav className="asia-jump" aria-label="ページ内メニュー">
        {MENU.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <div className="card asia-intro">
        {t.intro.map((p, i) => <p key={i}>{p}</p>)}
        <p className="muted">内容は{fmtDate(t.updated)}時点で公式サイトなどから確認したものです。</p>
      </div>

      {t.links && t.links.length > 0 && (
        <div className="kj-official" aria-label="公式サイト">
          <span className="kj-official-h">公式サイト</span>
          {t.links.map((l, i) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className={i === 0 ? "btn" : "btn ghost"}>{l.label} ↗</a>
          ))}
          <span className="muted kj-official-note">開催日・入場方法・料金の最新情報は公式サイトで確認してください。</span>
        </div>
      )}

      {t.photos && t.photos.length > 0 && (
        <div className={`asia-photos n${Math.min(t.photos.length, 3)}`}>
          {t.photos.map((ph) => (
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
        {t.quickFacts.map((f) => (
          <div key={f.k} className="stat"><div className="k">{f.k}</div><div className="v">{f.v}</div>{f.s && <div className="s">{f.s}</div>}</div>
        ))}
      </div>

      <div className="sec-title" id="info"><h2>基本情報</h2></div>
      <article className="card asia-track" style={{ borderLeftColor: t.org === "JRA" ? "#1f7a3d" : "#b5541c" }}>
        <dl>
          <dt>主催</dt><dd>{t.orgLabel}</dd>
          <dt>住所</dt><dd>{t.address}</dd>
          <dt>開催時期</dt><dd>{t.season}</dd>
          <dt>入場料</dt><dd>{t.admission}</dd>
          <dt>最寄り駅など</dt><dd><ul>{t.access.map((a) => <li key={a}>{a}</li>)}</ul></dd>
          {t.links && t.links.length > 0 && (
            <>
              <dt>公式・関連サイト</dt>
              <dd><ul>{t.links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>{l.note && <span className="muted">（{l.note}）</span>}</li>)}</ul></dd>
            </>
          )}
        </dl>
      </article>

      <div className="sec-title" id="course"><h2>コースの特徴</h2></div>
      <div className="card flush">
        <table className="list kj-compare">
          <thead><tr><th>コース</th><th>回り</th><th>1周</th><th>最後の直線</th><th className="hide-sm">高低差</th></tr></thead>
          <tbody>
            {t.courses.map((c) => (
              <tr key={c.name}><td><b>{c.name}</b></td><td>{c.turn}</td><td>{c.lap ?? "—"}</td><td>{c.straight ?? "—"}</td><td className="hide-sm">{c.drop ?? "—"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <ul className="asia-check">{t.courseNotes.map((n) => <li key={n}>{n}</li>)}</ul>
      </div>

      {t.fromJapan && t.fromJapan.length > 0 && (
        <>
          <div className="sec-title" id="access"><h2>東京・広島からの行き方</h2></div>
          <p className="asia-note">所要時間は<b>目安</b>です。便名・時刻を書いたものは2026年11月時点の時刻表の例で、曜日や季節で変わります。出発前にかならず下の公式時刻表で確認してください。</p>
          <div className="asia-routes">
            {t.fromJapan.map((r) => (
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
                {r.links && r.links.length > 0 && (
                  <p className="asia-route-links">時刻表など：{r.links.map((l, i) => <span key={l.url}>{i > 0 && "／"}<a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></span>)}</p>
                )}
              </article>
            ))}
          </div>
        </>
      )}

      <div className="sec-title" id="howto"><h2>{t.org === "JRA" ? "中央競馬" : "地方競馬"}の遊び方 5ステップ</h2></div>
      <ol className="steps">
        {howto.map((s) => <li key={s.title}><strong>{s.title}</strong>{s.body}</li>)}
      </ol>

      <div className="sec-title" id="races"><h2>知っておきたい大レース</h2></div>
      <div className="features">
        {t.bigRaces.map((r) => (
          <div key={r.name} className="card asia-race">
            <strong>{r.name}</strong>
            <p className="muted" style={{ margin: "0 0 4px" }}>{r.when}｜{r.where}</p>
            <p style={{ margin: 0 }}>{r.body}</p>
          </div>
        ))}
      </div>

      <div className="cta-band asia-pog" id="pog">
        <div>
          <strong>POG好きのための{t.short}の見どころ</strong>
          <ul>{t.pogCorner.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      </div>

      <div className="sec-title"><h2>場内・まわりの見どころ</h2></div>
      <div className="features">
        {t.spots.map((x) => (
          <div key={x.title} className="card"><strong>{x.title}</strong><p style={{ margin: 0 }}>{x.body}</p></div>
        ))}
      </div>

      <div className="sec-title" id="food"><h2>競馬のあとに食べたい ご当地グルメ</h2></div>
      <div className="asia-foods">
        {t.foods.map((f) => (
          <div key={f.name} className="card asia-food">
            <FoodIcon kind={f.icon} />
            <div>
              <strong>{f.name}</strong> <span className="muted">{f.local}</span>
              <p className="asia-food-where">{f.where}</p>
              <p>{f.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sec-title" id="plan"><h2>モデルプラン</h2></div>
      <div className="asia-plans">
        <details className="card asia-plan" open>
          <summary>
            <span className="asia-plan-nights">{t.plan.nights}</span>
            <strong>{t.plan.title}</strong>
            <small>{t.plan.catch}</small>
          </summary>
          <p className="muted">おすすめ：{t.plan.best}</p>
          {t.plan.days.map((d) => (
            <div key={d.label} className="asia-day">
              <h4>{d.label}</h4>
              <ul className="asia-timeline">
                {d.items.map((it, i) => <li key={i}><time>{it.time}</time><span>{it.text}</span></li>)}
              </ul>
            </div>
          ))}
          <ul className="asia-tips">{t.plan.tips.map((x) => <li key={x}>{x}</li>)}</ul>
        </details>
      </div>

      <div className="sec-title" id="manners"><h2>マナーと注意点</h2></div>
      <div className="card">
        <ul className="asia-check">{[...(t.manners ?? []), ...COMMON_MANNERS].map((m) => <li key={m}>{m}</li>)}</ul>
      </div>

      <div className="sec-title"><h2>出典・参考（確認日）</h2></div>
      <div className="card asia-sources">
        <ul>
          {t.sources.map((s) => (
            <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a> <span className="muted">（{s.date}）</span></li>
          ))}
        </ul>
        <p className="muted" style={{ marginBottom: 0 }}>コースの特徴の文章はこのサイトで公式の数字をもとにまとめたものです。イラストはこのサイトのオリジナル、写真はWikimedia Commonsのフリーライセンス写真です。料金・時間・開催日は変わることがあります。馬券は無理のない範囲で楽しみましょう。</p>
      </div>

      <div className="sec-title"><h2>ほかの{t.org === "JRA" ? "中央競馬" : "地方競馬"}の競馬場</h2></div>
      <nav className="asia-others" aria-label="ほかの競馬場">
        {same.map((o) => <Link key={o.slug} href={`/keibajo/${o.slug}`}>{o.name}</Link>)}
      </nav>
      <p style={{ textAlign: "center", marginTop: 24 }}><Link href="/keibajo" className="btn">全国競馬場ガイドのトップへ</Link></p>
    </>
  );
}
