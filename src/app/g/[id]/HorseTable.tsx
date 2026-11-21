import type { Horse, ResultWithRace } from "@/lib/group-data";
import type { HorseScore } from "@/lib/standings";
import { formatMan } from "@/lib/util";
import { HorseLabel, Finish } from "@/components/HorseLabel";

/** 指名馬ごとの成績一覧 */
export function HorseTable({
  groupId, scores, horseMap, results, includeNonJra, actions,
}: {
  groupId: string;
  scores: HorseScore[];
  horseMap: Map<string, Horse>;
  results: ResultWithRace[];
  includeNonJra: boolean;
  actions?: (horseId: string) => React.ReactNode;
}) {
  if (scores.length === 0) return <div className="card muted">まだ指名馬がいません。</div>;
  return (
    <>
      {scores.map((s) => {
        const h = horseMap.get(s.horse_id);
        const races = results.filter((r) => r.horse_id === s.horse_id);
        return (
          <div className="horse-card" key={s.horse_id}>
            <div className="hc-head">
              <div>
                <HorseLabel id={s.horse_id} horse={h} groupId={groupId} showTrainer />
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
