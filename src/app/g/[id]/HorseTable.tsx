import type { Horse, ResultWithRace } from "@/lib/group-data";
import type { HorseScore } from "@/lib/standings";
import { formatMan } from "@/lib/util";
import { HorseLabel, Finish, MarkBadges } from "@/components/HorseLabel";
import type { HorseMarks } from "@/lib/horse-marks";
import { finishCounts, earnedPrize, splitTrainer } from "@/lib/horse-summary";
import Link from "next/link";

/** 指名馬の一覧表（1頭1行。空き枠も表示する） */
export function HorseSummaryTable({
  groupId, scores, horseMap, results, includeNonJra, slots, marks,
}: {
  groupId: string;
  scores: HorseScore[];
  horseMap: Map<string, Horse>;
  results: ResultWithRace[];
  includeNonJra: boolean;
  slots: number;
  marks?: HorseMarks;
}) {
  const thisYear = new Date().getFullYear();
  const empty = Math.max(0, slots - scores.length);
  return (
    <div className="card flush scroll">
      <table className="list compact summary">
        <thead>
          <tr>
            <th className="c">No</th><th>馬名</th><th className="c">性齢</th><th className="c">成績</th>
            <th className="num">賞金</th><th className="num">直近</th>
            <th className="num" title="中央のレースから計算した目安です">収得賞金</th>
            <th>厩舎</th><th>血統</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => {
            const h = horseMap.get(s.horse_id);
            const races = results.filter((r) => r.horse_id === s.horse_id && (r.is_jra || includeNonJra));
            const [w1, w2, w3, wx] = finishCounts(races);
            const t = splitTrainer(h?.trainer);
            const age = h?.birth_year ? thisYear - h.birth_year : null;
            return (
              <tr key={s.horse_id}>
                <td className="c muted">{i + 1}</td>
                <td><Link className="horse-name" href={`/g/${groupId}/h/${s.horse_id}`}>{h?.name ?? s.horse_id}</Link><MarkBadges id={s.horse_id} trainer={h?.trainer} marks={marks} /></td>
                <td className="c nowrap">{h?.sex && <span className={`sex sex-${h.sex}`}>{h.sex}{age ?? ""}</span>}</td>
                <td className="c nowrap">{s.starts === 0 ? <span className="muted">未出走</span> : `[${w1}-${w2}-${w3}-${wx}]`}</td>
                <td className="num"><strong>{formatMan(s.points)}</strong></td>
                <td className="num">{s.weekPoints > 0 ? <span className="up">+{formatMan(s.weekPoints)}</span> : <span className="muted">+0</span>}</td>
                <td className="num">{formatMan(earnedPrize(races))}</td>
                <td className="nowrap">{t.name}{t.area && <span className="sub"> {t.area}</span>}</td>
                <td className="ped-cell">
                  <div>父 {h?.sire ? <Link href={`/sires/${encodeURIComponent(h.sire)}`} className="sire-link">{h.sire}</Link> : "-"}</div>
                  <div>母 {h?.dam ?? "-"}</div>
                </td>
              </tr>
            );
          })}
          {Array.from({ length: empty }, (_, k) => (
            <tr key={`empty-${k}`} className="empty-slot">
              <td className="c muted">{scores.length + k + 1}</td>
              <td className="muted">（空き枠）</td>
              <td /><td className="c muted">[0-0-0-0]</td><td className="num muted">0</td><td /><td className="num muted">0</td><td /><td />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 指名馬ごとの成績一覧 */
export function HorseTable({
  groupId, scores, horseMap, results, includeNonJra, actions, slots, marks,
}: {
  groupId: string;
  scores: HorseScore[];
  horseMap: Map<string, Horse>;
  results: ResultWithRace[];
  includeNonJra: boolean;
  actions?: (horseId: string) => React.ReactNode;
  slots?: number;
  marks?: HorseMarks;
}) {
  if (scores.length === 0 && !slots) return <div className="card muted">まだ指名馬がいません。</div>;
  return (
    <>
      <HorseSummaryTable groupId={groupId} scores={scores} horseMap={horseMap} results={results} includeNonJra={includeNonJra} slots={slots ?? scores.length} marks={marks} />
      {scores.length > 0 && <div className="sec-title"><h2>レースごとの成績</h2></div>}
      {scores.map((s) => {
        const h = horseMap.get(s.horse_id);
        const races = results.filter((r) => r.horse_id === s.horse_id);
        return (
          <div className="horse-card" key={s.horse_id}>
            <div className="hc-head">
              <div>
                <HorseLabel id={s.horse_id} horse={h} groupId={groupId} showTrainer marks={marks} />
              </div>
              <div className="hc-pts">
                <strong>{formatMan(s.points)}</strong><span className="muted"> 万円</span>
                {s.weekPoints > 0 && <div className="up">今週 +{formatMan(s.weekPoints)}</div>}
                <div className="muted">{s.starts === 0 ? "未出走" : `${s.starts}戦${s.wins}勝`}</div>
                {actions?.(s.horse_id)}
              </div>
            </div>
            {races.length > 0 && (
              <div className="scroll">
                <table className="list compact">
                  <thead>
                    <tr><th>日付</th><th>レース</th><th className="c">着順</th><th className="num">賞金</th></tr>
                  </thead>
                  <tbody>
                    {races.map((r) => (
                      <tr key={`${r.race_date}${r.race_name}`}>
                        <td className="feed-date">{r.race_date.replaceAll("-", "/")}</td>
                        <td>{r.venue} {r.race_name}{!r.is_jra && !includeNonJra && <span className="muted">（対象外）</span>}</td>
                        <td className="c"><Finish finish={r.finish} /></td>
                        <td className="num">{r.prize_man > 0 ? formatMan(r.prize_man) : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
