import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { horseDescription, isHorseId, loadPublicHorse } from "@/lib/horse-public";
import { finishCounts, earnedPrize } from "@/lib/horse-summary";
import { horsePageUrl, shutubaUrl } from "@/lib/netkeiba/fetch";
import { formatMan } from "@/lib/util";
import { SITE_URL } from "@/config/site";
import { Finish } from "@/components/HorseLabel";

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

async function load(id: string) {
  if (!isHorseId(id)) return null;
  return loadPublicHorse(id);
}

function record(results: { finish: string | null; prize_man: number }[]) {
  return {
    starts: results.length,
    wins: results.filter((r) => r.finish === "1").length,
    prize: Math.round(results.reduce((s, r) => s + r.prize_man, 0) * 10) / 10,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const d = await load(id);
  if (!d) return { title: "馬が見つかりません", robots: { index: false } };
  const h = d.horse;
  const title = `${h.name} POG｜${h.sire ? `父${h.sire}` : "血統"}・成績・指名数`;
  const description = horseDescription(h, record(d.results), d.picks);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/horse/${id}` },
    openGraph: { title, description, url: `/horse/${id}`, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export default async function PublicHorsePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await load(id);
  if (!d) notFound();
  const { horse, results, entries, picks, siblings } = d;
  const rec = record(results);
  const [w1, w2, w3, out] = finishCounts(results);
  const earned = earnedPrize(results);

  const { supabase, user } = await getUser();
  const groups = user
    ? ((await supabase.from("group_members").select("groups(id, name, crop_year)").eq("user_id", user.id)).data ?? [])
        .map((m) => m.groups as unknown as { id: string; name: string; crop_year: number } | null)
        .filter((g): g is { id: string; name: string; crop_year: number } => !!g && (!horse.birth_year || g.crop_year === horse.birth_year))
    : [];

  const prof: [string, React.ReactNode][] = [
    ["生年", horse.birth_year ? `${horse.birth_year}年` : null],
    ["性別", horse.sex],
    ["父", horse.sire ? <Link href={`/sires/${encodeURIComponent(horse.sire)}`}>{horse.sire}</Link> : null],
    ["母", horse.dam],
    ["母父", horse.damsire],
    ["調教師", horse.trainer ? <Link href={`/trainers/${encodeURIComponent(horse.trainer)}`}>{horse.trainer}</Link> : null],
    ["馬主", horse.owner ? <Link href={`/owners/${encodeURIComponent(horse.owner)}`}>{horse.owner}</Link> : null],
    ["生産者", horse.breeder ? <Link href={`/breeders/${encodeURIComponent(horse.breeder)}`}>{horse.breeder}</Link> : null],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "トップ", item: `${SITE_URL}/` },
          ...(horse.sire ? [{ "@type": "ListItem", position: 2, name: `${horse.sire}産駒`, item: `${SITE_URL}/sires/${encodeURIComponent(horse.sire)}` }] : []),
          { "@type": "ListItem", position: horse.sire ? 3 : 2, name: horse.name, item: `${SITE_URL}/horse/${id}` },
        ],
      },
      {
        "@type": "WebPage",
        name: `${horse.name} POG`,
        url: `${SITE_URL}/horse/${id}`,
        description: horseDescription(horse, rec, picks),
        ...(horse.updated_at ? { dateModified: horse.updated_at } : {}),
        about: { "@type": "Thing", name: horse.name, sameAs: horsePageUrl(id) },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <p className="muted" style={{ margin: "0 0 8px" }}>
        <Link href="/">トップ</Link>
        {horse.sire && <> › <Link href={`/sires/${encodeURIComponent(horse.sire)}`}>{horse.sire}産駒</Link></>}
        {" "}› {horse.name}
      </p>
      <div className="card" style={{ borderLeft: "4px solid var(--accent)" }}>
        <h1 style={{ margin: 0 }}>
          {horse.name}
          {horse.sex && <span className={`sex sex-${horse.sex}`} style={{ fontSize: 13, verticalAlign: 4 }}>{horse.sex}</span>}
          <span className="muted" style={{ fontSize: 14, fontWeight: 400, marginLeft: 8 }}>POG情報</span>
        </h1>
        <div className="ped" style={{ fontSize: 13 }}>
          {horse.sire && <>父 <Link href={`/sires/${encodeURIComponent(horse.sire)}`} className="sire-link"><b>{horse.sire}</b></Link></>}
          {horse.dam && <>　母 <b>{horse.dam}</b></>}
          {horse.damsire && <>（母父 {horse.damsire}）</>}
          {horse.trainer && <>　{horse.trainer}</>}
        </div>
        <div style={{ marginTop: 10 }}>
          {groups.length > 0 ? (
            <span className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              {groups.map((g) => (
                <Link key={g.id} href={`/g/${g.id}/h/${id}`} className="btn">「{g.name}」で指名する</Link>
              ))}
            </span>
          ) : user ? (
            <Link href="/groups/new" className="btn">大会を作ってこの馬を指名する</Link>
          ) : (
            <Link href={`/login?mode=signup&next=${encodeURIComponent(`/horse/${id}`)}`} className="btn">無料登録してこの馬を指名する</Link>
          )}
          <span className="muted" style={{ marginLeft: 12 }}>
            <a href={horsePageUrl(id)} target="_blank" rel="noreferrer">netkeibaで見る ›</a>
          </span>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><div className="k">通算成績</div><div className="v">{rec.starts}<small>戦</small>{rec.wins}<small>勝</small></div><div className="s">[{w1}-{w2}-{w3}-{out}]</div></div>
        <div className="stat"><div className="k">本賞金</div><div className="v">{formatMan(rec.prize)}<small>万円</small></div><div className="s">収得賞金の目安 {formatMan(earned)}万円</div></div>
        <div className="stat"><div className="k">このサイトでの指名数</div><div className="v">{picks}<small>グループ</small></div></div>
      </div>

      {entries.length > 0 && (
        <>
          <div className="sec-title"><h2>出走予定</h2></div>
          <div className="card flush">
            <table className="list">
              <tbody>
                {entries.map((e) => {
                  const dt = new Date(`${e.race_date}T00:00:00Z`);
                  return (
                    <tr key={e.race_id}>
                      <td className="feed-date">{dt.getUTCMonth() + 1}/{dt.getUTCDate()}（{WEEK[dt.getUTCDay()]}）</td>
                      <td><span className="big">{e.venue}{e.race_no}R</span> <a href={shutubaUrl(e.race_id)} target="_blank" rel="noreferrer">{e.race_name ?? "出馬表"}</a></td>
                      <td className="num sub">{e.post_time ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="sec-title"><h2>{horse.name}の競走成績</h2><span className="muted">賞金は本賞金（万円）</span></div>
      {results.length === 0 ? (
        <div className="card muted">まだレースに出ていません。</div>
      ) : (
        <div className="card flush scroll">
          <table className="list compact">
            <thead><tr><th>日付</th><th>開催</th><th>レース</th><th className="c">着順</th><th className="num">賞金</th></tr></thead>
            <tbody>
              {results.map((r) => (
                <tr key={`${r.race_date}${r.race_name}`}>
                  <td className="feed-date">{r.race_date.replaceAll("-", "/")}</td>
                  <td>{r.venue}</td>
                  <td>{r.race_name}</td>
                  <td className="c"><Finish finish={r.finish} /></td>
                  <td className="num">{r.prize_man > 0 ? formatMan(r.prize_man) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="sec-title"><h2>プロフィール</h2></div>
      <div className="card flush">
        <table className="list">
          <tbody>
            {prof.map(([k, v]) => (
              <tr key={k}><th style={{ width: "7em", background: "var(--th)" }}>{k}</th><td>{v ?? <span className="muted">-</span>}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {siblings.length > 0 && (
        <>
          <div className="sec-title"><h2>{horse.dam}の産駒（兄弟姉妹）</h2></div>
          <div className="card flush">
            <table className="list">
              <tbody>
                {siblings.map((s) => (
                  <tr key={s.id}>
                    <td><Link className="horse-name" href={`/horse/${s.id}`}>{s.name}</Link></td>
                    <td className="sub">{s.birth_year ? `${s.birth_year}年生` : ""}</td>
                    <td className="sub">{s.sire ? `父 ${s.sire}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <strong>POG大会を仲間と開こう</strong>
        <p className="muted" style={{ margin: "4px 0 8px" }}>大会を作って招待リンクを送るだけ。指名は馬名を数文字入れるだけで、成績と順位は毎晩自動で更新されます。</p>
        <Link href={user ? "/groups/new" : "/login?mode=signup"} className="btn">無料で大会を作る</Link>{" "}
        <Link href="/horses" className="btn secondary">ほかの馬を探す</Link>
      </div>
    </>
  );
}
