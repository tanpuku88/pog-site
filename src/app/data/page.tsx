import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { groupHref, KIND_LIST, previousSeason, shortName } from "@/lib/connections";
import { loadCropData, sireTable } from "@/lib/sires";
import { defaultSeason } from "@/lib/standings";
import { formatMan, todayJst } from "@/lib/util";
import { DataTabs } from "@/components/DataTabs";
import { AreaTabs } from "@/components/AreaTabs";
import { cropOfArea } from "@/lib/connections";
import { AREA_LABEL, areaHref, parseArea } from "@/lib/area";

export const revalidate = 3600;
export const metadata = {
  title: `POGデータ ${defaultSeason().crop_year}年生まれ2歳馬｜種牡馬・厩舎・馬主・生産牧場`,
  description: "POGのドラフトの参考に。種牡馬・厩舎・馬主・生産牧場ごとの2歳馬の勝ち上がり率・賞金・指名数をまとめています。",
  alternates: { canonical: "/data" },
};

export default async function DataHub({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const area = parseArea((await searchParams).area);
  const season = defaultSeason();
  const prev = previousSeason();
  const rules = { ...season, include_non_jra: true };
  const cur = cropOfArea(await loadCropData(createAdminClient(), season.crop_year, rules), area);
  const today = todayJst();
  const tables = KIND_LIST.map((kind) => ({ kind, rows: sireTable(cur.horses, cur.picks, cur.tally, cur.races, today, kind.field) }));

  return (
    <>
      <DataTabs current="hub" />
      <h1 style={{ marginBottom: 4 }}>POGデータ（{season.crop_year}年生まれ世代・{AREA_LABEL[area]}）</h1>
      <AreaTabs path="/data" current={area} />
      <p className="muted" style={{ marginTop: 0 }}>
        ドラフトの参考になる「どこの馬が走っているか」を、種牡馬・厩舎・馬主・生産牧場の4つの切り口でまとめました。
        名前を押すと、所属する2歳馬の一覧と前の世代（{prev.crop_year}年生まれ）の成績が見られます。
      </p>
      <div className="data-hub">
        {tables.map(({ kind, rows }) => {
          const byPoints = rows.slice(0, 10);
          const byRate = [...rows].filter((r) => r.starters >= 5).sort((a, b) => (b.winnerRate ?? 0) - (a.winnerRate ?? 0) || b.winners - a.winners).slice(0, 5);
          return (
            <section className="box" key={kind.path}>
              <h2 className="box-head">{kind.label} 賞金ランキング<small>{kind.lead}</small></h2>
              {byPoints.length === 0 ? <p className="box-empty">まだデータがありません</p> : (
                <ol className="mini-rank">
                  {byPoints.map((r) => (
                    <li key={r.sire}>
                      <span className={`mr-no rk-${r.rank}`}>{r.rank}</span>
                      <span className="mr-main">
                        <Link className="horse-name" href={areaHref(groupHref(kind, r.sire), area)} title={r.sire}>{shortName(r.sire)}</Link>
                        <span className="mr-sub">{r.horses}頭・勝ち上がり{r.winners}/{r.starters}{r.top ? `・${r.top.name}` : ""}</span>
                      </span>
                      <span className="mr-val">{formatMan(r.points)}</span>
                    </li>
                  ))}
                </ol>
              )}
              {byRate.length > 0 && (
                <p className="box-text hub-rate">
                  <b>勝ち上がり率が高い{kind.label}</b>（出走5頭以上）<br />
                  {byRate.map((r, i) => (
                    <span key={r.sire} className="nw">{i > 0 && "／"}<Link href={areaHref(groupHref(kind, r.sire), area)}>{shortName(r.sire)}</Link> {r.winnerRate?.toFixed(0)}%</span>
                  ))}
                </p>
              )}
              <Link className="box-more" href={areaHref(kind.path, area)}>{kind.label}ランキングをすべて見る ›</Link>
            </section>
          );
        })}
      </div>
      <p className="ext-note">賞金は万円。中央と地方は別々に集計しています。勝ち上がり率は「1勝以上した頭数 ÷ 出走した頭数」。</p>
    </>
  );
}
