import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { aggregateSires, loadCropData } from "@/lib/sires";
import { defaultSeason } from "@/lib/standings";
import { withRanks } from "@/lib/popular";
import { formatMan } from "@/lib/util";
import { Rank } from "@/components/HorseLabel";

export const metadata = { title: "種牡馬ランキング | POG" };
export const revalidate = 3600;

const SORTS = {
  points: { label: "賞金順", key: (r: { points: number }) => r.points },
  picks: { label: "人気順", key: (r: { picks: number }) => r.picks },
  winners: { label: "勝ち上がり順", key: (r: { winners: number }) => r.winners },
  horses: { label: "産駒数順", key: (r: { horses: number }) => r.horses },
} as const;
type SortKey = keyof typeof SORTS;

export default async function Sires({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams;
  const sortKey: SortKey = sort && sort in SORTS ? (sort as SortKey) : "points";
  const season = defaultSeason();
  const rules = { ...season, include_non_jra: false };
  const { horses, picks, tally } = await loadCropData(createAdminClient(), season.crop_year, rules);
  const key = SORTS[sortKey].key;
  const rows = withRanks(
    aggregateSires(horses, picks, tally).sort((a, b) => key(b) - key(a) || b.points - a.points || b.horses - a.horses),
    key,
  ).slice(0, 50);

  return (
    <>
      <h1>{season.crop_year}年生まれ世代 種牡馬ランキング</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        このサイトに登録されている{horses.length.toLocaleString()}頭を父ごとに集計しています。賞金はJRA本賞金（万円）で、成績を取得済みの馬の分です。
      </p>
      <div className="seg" style={{ marginBottom: 10 }}>
        {(Object.keys(SORTS) as SortKey[]).map((k) => (
          <Link key={k} href={k === "points" ? "/sires" : `/sires?sort=${k}`} className={k === sortKey ? "on" : ""}>{SORTS[k].label}</Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="card muted">まだデータがありません。世代の馬の取り込みが終わると表示されます。</div>
      ) : (
        <div className="card flush scroll">
          <table className="list">
            <thead>
              <tr>
                <th className="c">順位</th>
                <th>種牡馬</th>
                <th className="num">産駒</th>
                <th className="num">指名</th>
                <th className="num hide-sm">出走</th>
                <th className="num">勝ち上がり</th>
                <th className="num">賞金</th>
                <th className="hide-sm">稼ぎ頭</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.sire}>
                  <td className="c"><Rank rank={r.rank} /></td>
                  <td><Link className="horse-name" href={`/sires/${encodeURIComponent(r.sire)}`}>{r.sire}</Link></td>
                  <td className="num">{r.horses}</td>
                  <td className="num">{r.picks || <span className="muted">-</span>}</td>
                  <td className="num hide-sm">{r.starters}</td>
                  <td className="num">{r.winners}{r.starters > 0 && <span className="sub"> ({Math.round((r.winners / r.starters) * 100)}%)</span>}</td>
                  <td className="num big">{r.points > 0 ? formatMan(r.points) : <span className="muted">-</span>}</td>
                  <td className="hide-sm sub">{r.top ? r.top.name : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
