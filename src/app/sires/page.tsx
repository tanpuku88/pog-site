import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { sireTable, loadCropData } from "@/lib/sires";
import { defaultSeason } from "@/lib/standings";
import { formatMan, todayJst } from "@/lib/util";
import { DataTabs } from "@/components/DataTabs";
import { cropOfArea, KINDS } from "@/lib/connections";
import { AreaTabs } from "@/components/AreaTabs";
import { AREA_LABEL, areaHref, parseArea } from "@/lib/area";

export const metadata = { title: "種牡馬ランキング | POG" };
export const revalidate = 3600;

type K = { points: number; picks: number; winners: number; horses: number; earned: number; aei: number | null };
const SORTS = {
  points: { label: "本賞金順", key: (r: K) => r.points },
  earned: { label: "収得賞金順", key: (r: K) => r.earned },
  aei: { label: "AEI順", key: (r: K) => r.aei ?? -1 },
  winners: { label: "勝ち上がり順", key: (r: K) => r.winners },
  picks: { label: "人気順", key: (r: K) => r.picks },
  horses: { label: "産駒数順", key: (r: K) => r.horses },
} as const;
type SortKey = keyof typeof SORTS;

export default async function Sires({ searchParams }: { searchParams: Promise<{ sort?: string; area?: string }> }) {
  const { sort, area: areaParam } = await searchParams;
  const area = parseArea(areaParam);
  const sortKey: SortKey = sort && sort in SORTS ? (sort as SortKey) : "points";
  const season = defaultSeason();
  const rules = { ...season, include_non_jra: true };
  const { horses, picks, tally, races } = cropOfArea(await loadCropData(createAdminClient(), season.crop_year, rules), area);
  const key = SORTS[sortKey].key;
  const all = sireTable(horses, picks, tally, races, todayJst());
  const rows = [...all].sort((a, b) => key(b) - key(a) || a.rank - b.rank).slice(0, 100);
  const maxPoints = Math.max(1, ...all.map((r) => r.points));
  const updated = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <DataTabs current={KINDS.sire} />
      <h1>{season.crop_year}年生まれ世代 {AREA_LABEL[area]}の種牡馬ランキング</h1>
      <AreaTabs path="/sires" current={area} extra={{ sort: sortKey === "points" ? undefined : sortKey }} />
      <div className="sire-meta">
        <span>集計期間：{season.season_start.slice(2, 4)}年MD 〜 {season.season_end.slice(2, 4)}年ダービー</span>
        <span className="muted">更新：{updated}</span>
      </div>
      <p className="muted" style={{ marginTop: 0 }}>
        {AREA_LABEL[area]}所属の{horses.length.toLocaleString()}頭を父ごとに集計（賞金は万円）。中央と地方は賞金の規模が違うので、別々に並べています。
        AEIは「1頭あたりの賞金」が同じ{AREA_LABEL[area]}の平均の何倍か、収得賞金は成績から計算した目安です。
      </p>
      <div className="seg" style={{ marginBottom: 10 }}>
        {(Object.keys(SORTS) as SortKey[]).map((k) => (
          <Link key={k} href={areaHref("/sires", area, { sort: k === "points" ? undefined : k })} className={k === sortKey ? "on" : ""}>{SORTS[k].label}</Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="card muted">まだデータがありません。世代の馬の取り込みが終わると表示されます。</div>
      ) : (
        <div className="card flush scroll">
          <table className="list compact sire-table">
            <thead>
              <tr>
                <th className="c">順位</th><th className="c">変動</th><th>種牡馬</th><th>グラフ</th>
                <th className="num">頭数</th><th className="num">出走<br />頭数</th><th className="num">出走<br />回数</th>
                <th className="c">戦績</th><th className="num">勝率</th><th className="num">収得<br />賞金</th><th className="num">本賞金</th>
                <th className="num">先週</th><th className="num">AEI</th><th className="num">指名</th><th>代表馬</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const now = r.points - r.lastWeek;
                return (
                  <tr key={r.sire}>
                    <td className="c">{r.rank}</td>
                    <td className="c">
                      {r.change > 0 && <span className="chg-up">↑{r.change}</span>}
                      {r.change < 0 && <span className="chg-down">↓{-r.change}</span>}
                    </td>
                    <td><Link className="horse-name" href={areaHref(`/sires/${encodeURIComponent(r.sire)}`, area)}>{r.sire}</Link></td>
                    <td className="graph">
                      <span className="bar-base" style={{ width: `${(now / maxPoints) * 100}%` }} />
                      <span className="bar-week" style={{ width: `${(r.lastWeek / maxPoints) * 100}%` }} />
                    </td>
                    <td className="num">{r.horses}</td>
                    <td className="num">{r.starters}</td>
                    <td className="num">{r.runs}</td>
                    <td className="c">{r.runs > 0 ? r.record.join("-") : <span className="muted">-</span>}</td>
                    <td className="num">{r.runs > 0 ? r.winRate.toFixed(1) : "-"}</td>
                    <td className="num">{formatMan(r.earned)}</td>
                    <td className="num"><strong>{formatMan(r.points)}</strong></td>
                    <td className="num">{r.lastWeek > 0 ? formatMan(r.lastWeek) : <span className="muted">0</span>}</td>
                    <td className="num">{r.aei !== null ? r.aei.toFixed(2) : "-"}</td>
                    <td className="num">{r.picks || <span className="muted">-</span>}</td>
                    <td>
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
    </>
  );
}
