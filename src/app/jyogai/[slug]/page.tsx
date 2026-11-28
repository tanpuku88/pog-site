import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FACILITIES, facilityBySlug, samePrefFacilities } from "@/content/jyogai";
import { SITE_NAME, SITE_URL } from "@/config/site";

export function generateStaticParams() {
  return FACILITIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = facilityBySlug(slug);
  if (!f) return {};
  const title = `${f.name}｜${f.pref}の場外馬券売り場ガイド`;
  const desc = `${f.pref}の場外発売所「${f.name}」（${f.kind}／${f.operator}）。所在地は${f.address}。${f.note ?? "発売する競馬・営業時間は公式サイトで確認を。"}`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/jyogai/${f.slug}` },
    openGraph: { title, description: desc, url: `/jyogai/${f.slug}`, type: "article", siteName: SITE_NAME, locale: "ja_JP", images: f.photos?.[0] ? [{ url: f.photos[0].src, alt: f.photos[0].alt }] : undefined },
    twitter: { card: f.photos?.[0] ? "summary_large_image" : "summary", title, description: desc, images: f.photos?.[0] ? [f.photos[0].src] : undefined },
  };
}

export default async function JyogaiDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = facilityBySlug(slug);
  if (!f) notFound();
  const related = samePrefFacilities(f);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "全国場外馬券売り場ガイド", item: `${SITE_URL}/jyogai` },
      { "@type": "ListItem", position: 3, name: f.name, item: `${SITE_URL}/jyogai/${f.slug}` },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="crumb"><Link href="/jyogai">全国場外馬券売り場ガイド</Link> ＞ {f.pref} ＞ {f.name}</p>
      <h1>{f.name}</h1>
      <p className="muted">{f.pref}｜{f.kind}｜{f.org === "JRA" ? "中央競馬（JRA）" : "地方競馬"}の場外発売所</p>

      {f.photos && f.photos.length > 0 && (
        <figure style={{ margin: "12px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.photos[0].src} alt={f.photos[0].alt} style={{ width: "100%", borderRadius: 8 }} loading="eager" fetchPriority="high" decoding="async" />
          <figcaption className="muted" style={{ fontSize: 12 }}>
            {f.photos[0].credit}（{f.photos[0].license}）／<a href={f.photos[0].page} target="_blank" rel="noreferrer">出典ページ</a>
          </figcaption>
        </figure>
      )}

      <div className="card">
        <table className="list">
          <tbody>
            <tr><th>所在地</th><td>{f.address}</td></tr>
            <tr><th>{f.org === "JRA" ? "運営" : "管理主催者"}</th><td>{f.operator}</td></tr>
            <tr><th>種別</th><td>{f.kind}</td></tr>
            {f.paidSeat !== undefined && f.paidSeat !== null && <tr><th>有料席</th><td>{f.paidSeat ? "あり" : "なし"}</td></tr>}
            {f.access && <tr><th>アクセス</th><td>{f.access}</td></tr>}
            {f.url && <tr><th>公式サイト</th><td><a href={f.url} target="_blank" rel="noreferrer">{f.url}</a></td></tr>}
          </tbody>
        </table>
      </div>

      {f.note && (
        <section>
          <div className="sec-title"><h2>この施設について</h2></div>
          <p>{f.note}</p>
        </section>
      )}

      {f.foods && f.foods.length > 0 && (
        <section>
          <div className="sec-title"><h2>周辺のおいしいお店</h2></div>
          {f.foods.map((food) => (
            <div className="card" key={food.name} style={{ marginBottom: 10 }}>
              <h3 style={{ marginTop: 0 }}>{food.name}</h3>
              <p>{food.body}</p>
              {food.must && <p style={{ marginBottom: 0 }}><b>注文するなら：</b>{food.must}</p>}
            </div>
          ))}
        </section>
      )}

      {f.spots && f.spots.length > 0 && (
        <section>
          <div className="sec-title"><h2>周辺の文化・見どころ</h2></div>
          {f.spots.map((s) => (
            <div className="card" key={s.title} style={{ marginBottom: 10 }}>
              <h3 style={{ marginTop: 0 }}>{s.title}</h3>
              <p style={{ marginBottom: 0 }}>{s.body}</p>
            </div>
          ))}
        </section>
      )}

      {(!f.foods || f.foods.length === 0) && (
        <p className="muted">周辺のグルメ・見どころ情報は順次追加していきます。発売する競馬の種類・営業日・営業時間は変わることがあるので、行く前に公式サイトで確認してください。</p>
      )}

      {related.length > 0 && (
        <section>
          <div className="sec-title"><h2>{f.pref}のほかの場外</h2></div>
          <div className="asia-countries">
            {related.map((r) => (
              <Link key={r.slug} href={`/jyogai/${r.slug}`} className="asia-country">
                <span className={`kj-badge ${r.org === "JRA" ? "jra" : "nar"}`}>{r.org}</span>
                <span>
                  <strong>{r.name}</strong>
                  <small>{r.kind}</small>
                  <span className="gt-go">施設を見る →</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p><Link href="/jyogai">← 全国場外馬券売り場ガイドに戻る</Link>｜<Link href="/jyogai/haishi">閉鎖した場外の記録</Link></p>
    </>
  );
}
