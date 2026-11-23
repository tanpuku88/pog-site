import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { groupHref, loadGroupRanking, shortName, winnerRate, type Kind } from "@/lib/connections";
import { formatMan } from "@/lib/util";
import { DataTabs } from "./DataTabs";

type R = Awaited<ReturnType<typeof loadGroupRanking>>["rows"][number];
const SORTS = {
  points: { label: "賞金順", key: (r: R) => r.points },
  winners: { label: "勝ち上がり頭数", key: (r: R) => r.winners },
  winrate: { label: "勝率", key: (r: R) => (r.runs >= 10 ? r.winRate : -1) },
  rate: { label: "勝ち上がり率", key: (r: R) => (r.starters >= 3 ? r.winnerRate ?? 0 : -1) },
  horses: { label: "2歳馬の数", key: (r: R) => r.horses },
  picks: { label: "指名数", key: (r: R) => r.picks },
} as const;
export type GroupSort = keyof typeof SORTS;
export const isGroupSort = (s?: string): s is GroupSort => !!s && s in SORTS;

/** 厩舎・馬主・生産牧場のランキング表（今の2歳世代） */
export async function GroupRanking({ kind, sort }: { kind: Kind; sort?: string }) {
  const sortKey: GroupSort = isGroupSort(sort) ? sort : "points";
  const { season, prev, rows: all, prevRows, horseCount } = await loadGroupRanking(createAdminClient(), kind);
  const key = SORTS[sortKey].key;
  const rows = [...all].sort((a, b) => key(b) - key(a) || a.rank - b.rank).slice(0, 100);
  const maxPoints = Math.max(1, ...all.map((r) => r.points));

  return (
    <>
      <DataTabs current={kind} />
      <h1 style={{ marginBottom: 4 }}>{season.crop_year}年生まれ世代 {kind.label}ランキング</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {kind.lead}をPOG向けにまとめました（このサイトに登録されている{horseCount.toLocaleString()}頭・中央・地方のレース・賞金は万円）。
        勝率は「1着の回数 ÷ 出走回数」、勝ち上がり率は「1勝以上した頭数 ÷ 出走した頭数」です。
      </p>
      <div className="seg seg-wrap" style={{ marginBottom: 10 }}>
        {(Object.keys(SORTS) as GroupSort[]).map((k) => (
          <Link key={k} href={k === "points" ? kind.path : `${kind.path}?sort=${k}`} className={k === sortKey ? "on" : ""}>{SORTS[k].label}</Link>
        ))}
      </div>
      {sortKey === "winrate" && <p className="muted" style={{ margin: "0 0 8px" }}>勝率順は、のべ10回以上出走した{kind.label}だけを上に並べています。</p>}
      {sortKey === "rate" && <p className="muted" style={{ margin: "0 0 8px" }}>勝ち上がり率順は、出走3頭以上の{kind.label}だけを上に並べています。</p>}
      {rows.length === 0 ? (
        <div className="card muted">まだデータがありません。世代の馬の取り込みが終わると表示されます。</div>
      ) : (
        <div className="card flush scroll">
          <table className="list compact group-table">
            <thead>
              <tr>
                <th className="c">順位</th>
                <th>{kind.label}</th>
                <th className="num hide-sm">2歳<br />馬</th>
                <th className="num">勝ち<br />上がり</th>
                <th className="num">勝率</th>
                <th className="num">本賞金</th>
                <th className="hide-sm">グラフ</th>
                <th className="c hide-sm">戦績</th>
                <th className="num hide-sm">先週</th>
                <th className="num hide-sm">指名</th>
                <th className="num hide-sm">{prev.crop_year}年<br />世代</th>
                <th className="hide-sm">代表馬</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const old = prevRows.get(r.sire);
                const oldRate = old ? winnerRate(old) : null;
                return (
                  <tr key={r.sire} className={r.rank <= 3 && sortKey === "points" ? `top3 top-${r.rank}` : undefined}>
                    <td className="c">
                      <span className={`rk rk-${r.rank}`}>{r.rank}</span>
                      {r.change > 0 && <div className="chg-up">↑{r.change}</div>}
                      {r.change < 0 && <div className="chg-down">↓{-r.change}</div>}
                    </td>
                    <td className="g-name">
                      <Link className="horse-name" href={groupHref(kind, r.sire)} title={r.sire}>{shortName(r.sire)}</Link>
                      {r.top && <div className="sub show-sm-inline">代表 {r.top.name}</div>}
                    </td>
                    <td className="num hide-sm">{r.horses}<div className="sub">出走{r.starters}</div></td>
                    <td className="num">{r.winners}頭<div className="sub">{r.starters > 0 ? `/出走${r.starters}` : "-"}</div></td>
                    <td className="num">{r.runs > 0 ? <span className={`rate-pill${r.winRate >= 15 ? " hot" : ""}`}>{r.winRate.toFixed(1)}%</span> : <span className="muted">-</span>}<div className="sub">{r.runs > 0 ? `${r.runs}戦` : ""}</div></td>
                    <td className="num big">{r.points > 0 ? formatMan(r.points) : <span className="muted">0</span>}</td>
                    <td className="graph hide-sm">
                      <span className="bar-base" style={{ width: `${((r.points - r.lastWeek) / maxPoints) * 100}%` }} />
                      <span className="bar-week" style={{ width: `${(r.lastWeek / maxPoints) * 100}%` }} />
                    </td>
                    <td className="c hide-sm">{r.runs > 0 ? r.record.join("-") : <span className="muted">-</span>}</td>
                    <td className="num hide-sm">{r.lastWeek > 0 ? formatMan(r.lastWeek) : <span className="muted">0</span>}</td>
                    <td className="num hide-sm">{r.picks || <span className="muted">-</span>}</td>
                    <td className="num hide-sm">
                      {old && old.starters > 0 ? <>{formatMan(old.points)}<div className="sub">勝上{old.winners}/{old.starters}{oldRate !== null ? `(${oldRate.toFixed(0)}%)` : ""}</div></> : <span className="muted">-</span>}
                    </td>
                    <td className="hide-sm">
                      {r.top && <>
                        <span className={`sex-dot sex-${r.topSex ?? ""}`}>{r.topSex === "牝" ? "♀" : "♂"}</span>
                        <Link className="horse-name" href={`/horse/${r.top.id}`}>{r.top.name}</Link>
                      </>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="ext-note">
        {prev.crop_year}年世代は{prev.season_start.slice(0, 4)}年6月〜{prev.season_end.slice(0, 4)}年ダービーまでの成績（中央で出走した馬）です。
      </p>
    </>
  );
}
