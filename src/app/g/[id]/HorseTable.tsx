import type { Horse, ResultWithRace } from "@/lib/group-data";
import type { HorseScore } from "@/lib/standings";
import { horsePageUrl } from "@/lib/netkeiba/fetch";
import { formatMan } from "@/lib/util";

/** 指名馬ごとの成績一覧 */
export function HorseTable({
  scores, horseMap, results, includeNonJra, actions,
}: {
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
          <div className="card" key={s.horse_id}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <a href={horsePageUrl(s.horse_id)} target="_blank" rel="noreferrer"><strong>{h?.name ?? s.horse_id}</strong></a>
                {h?.sex && <span className="muted"> {h.sex}</span>}
                <div className="muted" style={{ fontSize: 13 }}>
                  {[h?.sire && `父 ${h.sire}`, h?.dam && `母 ${h.dam}`, h?.trainer].filter(Boolean).join(" ・ ")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <strong>{formatMan(s.points)}</strong><span className="muted"> 万円</span>
                <div className="muted" style={{ fontSize: 13 }}>{s.starts}戦{s.wins}勝</div>
                {actions?.(s.horse_id)}
              </div>
            </div>
            {races.length > 0 && (
              <table className="list" style={{ marginTop: 8, fontSize: 13 }}>
                <tbody>
                  {races.map((r) => (
                    <tr key={`${r.race_date}${r.race_name}`}>
                      <td style={{ whiteSpace: "nowrap" }}>{r.race_date.slice(5).replace("-", "/")}</td>
                      <td>{r.venue} {r.race_name}{!r.is_jra && !includeNonJra && <span className="muted">（対象外）</span>}</td>
                      <td className="num">{r.finish && /^\d+$/.test(r.finish) ? `${r.finish}着` : (r.finish ?? "-")}</td>
                      <td className="num">{r.prize_man > 0 ? formatMan(r.prize_man) : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </>
  );
}
