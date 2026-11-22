import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOST_TRACKS, findLost } from "@/content/keibajo/lost";
import type { LostTrack } from "@/content/keibajo/lost";
import { RaceHero } from "@/components/asia/Art";
import { SITE_NAME, SITE_URL, SUPERVISOR } from "@/config/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOST_TRACKS.map((t) => ({ slug: t.slug }));
}

const desc = (t: LostTrack) => `${t.name}（${t.pref}）の記録。${t.tagline}。${t.closed}。歴史・名馬・跡地の今・訪ね方をまとめました。`.slice(0, 160);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = findLost(slug);
  if (!t) return {};
  const title = `${t.name}の記録｜歴史・名馬・跡地の今`;
  const ph = t.photos?.[0];
  return {
    title,
    description: desc(t),
    keywords: [t.name, `${t.name} 跡地`, `${t.name} 廃止`, `${t.name} 名馬`],
    alternates: { canonical: `/keibajo/haishi/${t.slug}` },
    openGraph: { title, description: desc(t), url: `/keibajo/haishi/${t.slug}`, type: "article", siteName: SITE_NAME, locale: "ja_JP", images: ph ? [{ url: ph.src, alt: ph.alt }] : undefined },
    twitter: { card: ph ? "summary_large_image" : "summary", title, description: desc(t), images: ph ? [ph.src] : undefined },
  };
}

export default async function LostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = findLost(slug);
  if (!t) notFound();
  const url = `${SITE_URL}/keibajo/haishi/${t.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "全国競馬場ガイド", item: `${SITE_URL}/keibajo` },
        { "@type": "ListItem", position: 3, name: "なくなった競馬場の記録", item: `${SITE_URL}/keibajo/haishi` },
        { "@type": "ListItem", position: 4, name: t.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${t.name}の記録`,
      description: desc(t),
      inLanguage: "ja",
      mainEntityOfPage: url,
      dateModified: "2026-11-22",
      image: t.photos?.map((p) => p.src),
      author: { "@type": "Person", name: SUPERVISOR.name, url: `${SITE_URL}/supervisor` },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
  ];
  const others = [...LOST_TRACKS].sort((a, b) => a.closedYear - b.closedYear).filter((o) => o.slug !== t.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="crumb"><Link href="/keibajo">全国競馬場ガイド</Link> ＞ <Link href="/keibajo/haishi">なくなった競馬場の記録</Link> ＞ {t.name}</p>
      <section className="asia-hero">
        <RaceHero className="asia-hero-art" scene="city" sky={["#3b2f2a", "#a0785a", "#efd9b8"]} />
        <div className="asia-hero-text">
          <p className="lead-kicker"><span className="kj-mini lost">{t.kind}</span> {t.opened.match(/\d{4}/)?.[0] ?? ""}–{t.closedYear}</p>
          <h1>{t.name}</h1>
          <p>{t.tagline}</p>
        </div>
      </section>

      <div className="card asia-intro">
        {t.intro.map((p, i) => <p key={i}>{p}</p>)}
      </div>

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

      <div className="sec-title"><h2>基本データ</h2></div>
      <article className="card asia-track" style={{ borderLeftColor: "#7a5a3a" }}>
        <dl>
          <dt>場所</dt><dd>{t.address ?? t.pref}</dd>
          <dt>開設</dt><dd>{t.opened}</dd>
          <dt>最後</dt><dd>{t.closed}</dd>
          <dt>主催</dt><dd>{t.organizer}</dd>
          {t.course && (<><dt>コース</dt><dd>{t.course}</dd></>)}
          {t.why && (<><dt>なくなった理由</dt><dd>{t.why}</dd></>)}
        </dl>
      </article>

      {t.stars.length > 0 && (
        <>
          <div className="sec-title"><h2>ここで輝いた馬と人</h2></div>
          <div className="features">
            {t.stars.map((s) => <div key={s.name} className="card"><strong>{s.name}</strong><p style={{ margin: 0 }}>{s.body}</p></div>)}
          </div>
        </>
      )}

      {t.races.length > 0 && (
        <>
          <div className="sec-title"><h2>主なレース</h2></div>
          <div className="card"><ul className="asia-check">{t.races.map((r) => <li key={r}>{r}</li>)}</ul></div>
        </>
      )}

      <div className="sec-title"><h2>語り継ぎたいエピソード</h2></div>
      <div className="card"><ul className="asia-check">{t.episodes.map((e) => <li key={e}>{e}</li>)}</ul></div>

      <div className="sec-title"><h2>跡地の今と、残っているもの</h2></div>
      <div className="features">
        <div className="card"><strong>跡地の今</strong><ul style={{ margin: 0, paddingLeft: 18 }}>{t.now.map((n) => <li key={n}>{n}</li>)}</ul></div>
        <div className="card"><strong>残っているもの</strong><ul style={{ margin: 0, paddingLeft: 18 }}>{t.remains.map((n) => <li key={n}>{n}</li>)}</ul></div>
      </div>

      <div className="sec-title"><h2>訪ねるには</h2></div>
      <div className="card">
        <ul className="asia-check">{t.visit.map((v) => <li key={v}>{v}</li>)}</ul>
        <p className="muted" style={{ marginBottom: 0 }}>跡地の多くは病院・学校・住宅地・企業の施設です。入れない場所には入らず、まわりの人の迷惑にならないように見学しましょう。</p>
      </div>

      {t.related && t.related.length > 0 && (
        <p style={{ textAlign: "center" }}>{t.related.map((r) => <Link key={r.href} href={r.href} className="btn" style={{ margin: 4 }}>{r.label}</Link>)}</p>
      )}

      <div className="sec-title"><h2>出典・参考（確認日）</h2></div>
      <div className="card asia-sources">
        <ul>{t.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a> <span className="muted">（{s.date}）</span></li>)}</ul>
        <p className="muted" style={{ marginBottom: 0 }}>文章は出典をもとにこのサイトの言葉でまとめたものです。イラストはこのサイトのオリジナルです。写真はWikimedia Commonsで撮影者とライセンスを確認したもので、昔の写真はパブリックドメイン、空中写真は国土交通省の空中写真（出典を書けば使えるもの）です。</p>
      </div>

      <div className="sec-title"><h2>ほかの、なくなった競馬場</h2></div>
      <nav className="asia-others" aria-label="ほかの競馬場">
        {others.map((o) => <Link key={o.slug} href={`/keibajo/haishi/${o.slug}`}>{o.name}</Link>)}
      </nav>
      <p style={{ textAlign: "center", marginTop: 24 }}><Link href="/keibajo/haishi" className="btn">なくなった競馬場の記録トップへ</Link></p>
    </>
  );
}
