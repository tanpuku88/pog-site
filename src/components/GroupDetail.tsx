import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/config/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { groupHref, KINDS, loadGroupDetail, shortName, titleOf, topValues, winnerRate, type Kind } from "@/lib/connections";
import { defaultSeason } from "@/lib/standings";
import { formatMan } from "@/lib/util";
import { HorseLabel } from "./HorseLabel";
import { dataComment, writtenComment } from "@/lib/comments";
import { loadOverallRate, loadProfiles } from "@/lib/overall";
import { Meikan } from "./Meikan";
import { formatPrice, pricedHorses, returnRate } from "@/lib/sales";
import { DataTabs } from "./DataTabs";


export function groupMetadata(kind: Kind, name: string): Metadata {
  const { crop_year } = defaultSeason();
  const title = `${titleOf(kind, name)} POG｜${crop_year}年生まれ2歳馬一覧・勝ち上がり率・賞金`;
  const description = `${name}の${kind.member}（${crop_year}年生まれ世代）のPOG向けデータ。2歳馬の頭数・勝ち上がり率・賞金・指名数、前の世代の成績、${kind.member}の一覧をまとめています。`;
  const url = groupHref(kind, name);
  return { title: { absolute: title }, description, alternates: { canonical: url }, openGraph: { title, description, url } };
}

/** 関連する他の切り口（父・厩舎・馬主・生産牧場のうち、このページ以外） */
const RELATED: Record<Kind["field"], Kind[]> = {
  sire: [KINDS.trainer, KINDS.owner, KINDS.breeder],
  trainer: [KINDS.sire, KINDS.owner, KINDS.breeder],
  owner: [KINDS.sire, KINDS.trainer, KINDS.breeder],
  breeder: [KINDS.sire, KINDS.owner, KINDS.trainer],
};

export async function GroupDetail({ kind, name }: { kind: Kind; name: string }) {
  const { season, prev, summary, prevSummary, rows, prevTop, horses, races } = await loadGroupDetail(createAdminClient(), kind, name);
  const profileSet = await loadProfiles(season.crop_year, kind.field).catch(() => null);
  const profile = profileSet?.profiles[name] ?? null;
  const runs = races.length, wins = races.filter((r) => r.finish === "1").length;
  const winRate = runs > 0 ? (wins / runs) * 100 : null;
  const maxPoints = Math.max(1, ...rows.map((r) => r.t.points));
  const rate = summary ? winnerRate(summary) : null;
  const avgRate = await loadOverallRate(season.crop_year).catch(() => null);
  const tallyMap = new Map(rows.map((r) => [r.h.id, r.t]));
  const sold = pricedHorses(horses, tallyMap, "sale");
  const club = pricedHorses(horses, tallyMap, "club");
  const sum = (xs: { price: number; prize: number }[]) => xs.reduce((a, x) => ({ price: a.price + x.price, prize: a.prize + x.prize }), { price: 0, prize: 0 });
  const soldSum = sum(sold), clubSum = sum(club);
  const saleRate = returnRate(soldSum.prize, soldSum.price);
  const written = writtenComment(kind.field, name);
  const auto = summary ? dataComment(kind.field, kind.label, {
    horses: summary.horses, starters: summary.starters, winners: summary.winners, points: summary.points,
    topName: summary.top?.name ?? null, avgRate,
    prevStarters: prevSummary?.starters ?? 0, prevWinners: prevSummary?.winners ?? 0,
    sale: sold.length ? { sold: sold.length, price: soldSum.price, returnRate: saleRate } : null,
  }) : "";
  const prevRate = prevSummary ? winnerRate(prevSummary) : null;
  const colts = horses.filter((h) => h.sex !== "牝").length;
  const subCol = kind.field === "trainer" ? KINDS.owner : KINDS.trainer;
  const url = groupHref(kind, name);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: `${kind.label}ランキング`, item: `${SITE_URL}${kind.path}` },
      { "@type": "ListItem", position: 2, name: titleOf(kind, name), item: `${SITE_URL}${url}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <DataTabs current={kind} />
      <p className="crumb" style={{ margin: "0 0 6px" }}><Link href={kind.path}>‹ {kind.label}ランキング</Link></p>
      <h1 style={{ marginBottom: 4 }}>{titleOf(kind, name)}</h1>
      <p className="muted" style={{ marginTop: 0 }}>{season.crop_year}年生まれ世代のPOGデータ（中央・地方のレース・賞金は万円）</p>
      {!summary ? (
        <div className="card muted">この{kind.label}の{season.crop_year}年生まれの馬は登録されていません。</div>
      ) : (
        <>
          <Meikan field={kind.field} label={kind.label} name={name} title={titleOf(kind, name)}
            profile={profile ? { ...profile, winRate: winRate ?? profile.winRate } : null}
            avgWinRate={profileSet?.avgWinRate ?? null} count={profileSet?.count ?? 0} written={written} auto={auto} />
          <div className="stats">
            <div className="stat"><div className="k">2歳{kind.member}</div><div className="v">{summary.horses}<small>頭</small></div><div className="s">牡{colts}・牝{summary.horses - colts}</div></div>
            <div className="stat"><div className="k">勝ち上がり</div><div className="v">{summary.winners}<small>頭</small></div><div className="s">出走{summary.starters}頭{rate !== null ? `・勝ち上がり率${rate.toFixed(1)}%` : ""}</div></div>
            <div className="stat"><div className="k">勝率</div><div className="v">{winRate !== null ? winRate.toFixed(1) : "-"}<small>%</small></div><div className="s">{runs > 0 ? `${runs}戦${wins}勝` : "まだ出走なし"}</div></div>
            <div className="stat"><div className="k">本賞金の合計</div><div className="v">{formatMan(summary.points)}<small>万円</small></div><div className="s">{summary.top ? `稼ぎ頭 ${summary.top.name}` : "まだ賞金なし"}</div></div>
            <div className="stat"><div className="k">延べ指名数</div><div className="v">{summary.picks}</div><div className="s">このサイトの全大会</div></div>
            {(sold.length > 0 || club.length > 0) && (
              <div className="stat">
                <div className="k">{sold.length > 0 ? "セリで買われた馬" : "一口クラブの募集馬"}</div>
                {sold.length > 0
                  ? <><div className="v">{sold.length}<small>頭・回収率{saleRate !== null ? `${saleRate.toFixed(0)}%` : "-"}</small></div><div className="s">平均{formatPrice(Math.round(soldSum.price / sold.length))}円{club.length ? `・募集馬${club.length}頭` : ""}</div></>
                  : <><div className="v">{club.length}<small>頭・回収率{returnRate(clubSum.prize, clubSum.price)?.toFixed(0) ?? "-"}%</small></div><div className="s">平均募集総額{formatPrice(Math.round(clubSum.price / club.length))}円</div></>}
              </div>
            )}
            <div className="stat stat-prev">
              <div className="k">前の世代（{prev.crop_year}年生まれ）</div>
              {prevSummary && prevSummary.starters > 0
                ? <><div className="v">{prevSummary.winners}<small>頭 / 出走{prevSummary.starters}</small></div><div className="s">{prevRate !== null ? `勝ち上がり率${prevRate.toFixed(1)}%・` : ""}賞金{formatMan(prevSummary.points)}万円</div></>
                : <><div className="v">-</div><div className="s">データを集めています</div></>}
            </div>
          </div>

          <div className="rel-grid">
            {RELATED[kind.field].map((k) => {
              const tops = topValues(horses, (h) => h[k.field]);
              if (tops.length === 0) return null;
              return (
                <div className="box" key={k.path}>
                  <h3 className="box-head">主な{k.label}<small>{season.crop_year}年生まれ</small></h3>
                  <ul className="chip-list">
                    {tops.map((t) => (
                      <li key={t.name}><Link href={groupHref(k, t.name)} title={t.name}>{shortName(t.name)}</Link><span>{t.count}頭</span></li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="sec-title"><h2>{season.crop_year}年生まれの{kind.member}</h2><span className="muted">賞金の多い順</span></div>
          <div className="card flush scroll">
            <table className="list group-horses">
              <thead><tr><th>馬名・血統</th><th className="hide-sm">{subCol.label}</th><th className="num">指名</th><th className="num hide-sm">価格</th><th className="num">成績</th><th className="num">賞金</th></tr></thead>
              <tbody>
                {rows.map(({ h, picks: n, t }) => (
                  <tr key={h.id} className={t.wins > 0 ? "won" : undefined}>
                    <td className="name-cell"><HorseLabel id={h.id} horse={kind.field === "sire" ? { ...h, sire: null } : h} /></td>
                    <td className="hide-sm sub">{h[subCol.field] ? <Link href={groupHref(subCol, h[subCol.field]!)}>{shortName(h[subCol.field]!)}</Link> : ""}</td>
                    <td className="num">{n || <span className="muted">-</span>}</td>
                    <td className="num hide-sm sub">{h.sale_price_man ? <span className="price-chip" title={h.sale_name ?? "セリ"}>{formatPrice(Number(h.sale_price_man))}</span> : h.club_price_man ? <span className="price-chip club" title="一口クラブの募集総額">募{formatPrice(Number(h.club_price_man))}</span> : "-"}</td>
                    <td className="num">{t.starts === 0 ? <span className="rec-badge debut">未出走</span> : <span className={`rec-badge${t.wins > 0 ? " win" : ""}`}>{t.starts}戦{t.wins}勝</span>}</td>
                    <td className="num big prize-cell">{t.points > 0 ? <>{formatMan(t.points)}<span className="pz-bar" style={{ width: `${Math.max(6, (t.points / maxPoints) * 70)}%` }} /></> : <span className="muted">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {prevTop.length > 0 && (
        <>
          <div className="sec-title"><h2>前の世代の活躍馬</h2><span className="muted">{prev.crop_year}年生まれ・2歳〜ダービーまでの賞金</span></div>
          <div className="box">
            <ol className="mini-rank">
              {prevTop.map(({ h, t }, i) => (
                <li key={h.id}>
                  <span className={`mr-no rk-${i + 1}`}>{i + 1}</span>
                  <span className="mr-main"><Link className="horse-name" href={`/horse/${h.id}`}>{h.name}</Link><span className="mr-sub">{kind.field === "sire" ? `母 ${h.dam ?? "-"}` : `父 ${h.sire ?? "-"}`}・{t.starts}戦{t.wins}勝</span></span>
                  <span className="mr-val">{formatMan(t.points)}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
      <p className="ext-note">勝率は「1着の回数 ÷ 出走回数」、勝ち上がり率は「1勝以上した頭数 ÷ 出走した頭数」。</p>
    </>
  );
}
