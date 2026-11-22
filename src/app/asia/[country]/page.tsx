import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COUNTRIES, findCountry } from "@/content/asia";
import { FoodIcon, RaceHero, TrackMap } from "@/components/asia/Art";

export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ country: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const c = findCountry(country);
  if (!c) return {};
  return {
    title: `${c.name}競馬ガイド｜行き方・馬券の買い方・旅行プラン・グルメ`,
    description: `${c.name}の競馬を旅行で楽しむガイド。${c.tagline}。競馬場への行き方、馬券の買い方、モデルプラン、大レース、文化と地元グルメまで。`,
    alternates: { canonical: `/asia/${c.slug}` },
  };
}

const MENU = [
  ["tracks", "競馬場"],
  ["howto", "遊び方"],
  ["plans", "旅行プラン"],
  ["races", "大レース"],
  ["culture", "文化"],
  ["food", "グルメ"],
  ["manners", "注意点"],
] as const;

const fmtDate = (d: string) => d.replace(/^(\d{4})-(\d{2})-(\d{2})/, (_, y, m, dd) => `${y}年${Number(m)}月${Number(dd)}日`);

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = findCountry(country);
  if (!c) notFound();

  return (
    <>
      <p className="crumb"><Link href="/asia">アジア競馬ガイド</Link> ＞ {c.name}</p>
      <section className="asia-hero">
        <RaceHero className="asia-hero-art" />
        <div className="asia-hero-text">
          <p className="lead-kicker">{c.flag} {c.nameEn.toUpperCase()} RACING GUIDE</p>
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

      <div className="stats">
        {c.quickFacts.map((f) => (
          <div key={f.k} className="stat"><div className="k">{f.k}</div><div className="v">{f.v}</div>{f.s && <div className="s">{f.s}</div>}</div>
        ))}
      </div>

      <div className="sec-title" id="tracks"><h2>競馬場</h2></div>
      <div className="asia-tracks">
        <div className="card asia-map-card"><TrackMap tracks={c.tracks} /></div>
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
          <caption>馬券の言葉（指さしで使えます）</caption>
          <thead><tr><th>日本</th><th>現地</th><th>読み</th><th className="hide-sm">意味</th></tr></thead>
          <tbody>
            {c.terms.map((t) => (
              <tr key={t.jp}><td><b>{t.jp}</b></td><td className="asia-local">{t.local}</td><td>{t.read}</td><td className="hide-sm muted">{t.note ?? ""}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

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
        <p className="muted" style={{ marginBottom: 0 }}>イラストはすべてこのサイトのオリジナルです。料金・時間は目安で、変わることがあります。馬券は無理のない範囲で楽しみましょう。</p>
      </div>

      <p style={{ textAlign: "center", marginTop: 24 }}><Link href="/asia" className="btn">ほかの国を見る</Link></p>
    </>
  );
}
