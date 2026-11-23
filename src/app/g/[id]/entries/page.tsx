import { loadGroupBoard } from "@/lib/group-data";
import { todayJst } from "@/lib/util";
import { shutubaUrl } from "@/lib/netkeiba/fetch";
import { HorseLabel, MarkLegend } from "@/components/HorseLabel";
import { groupBoardMarks } from "@/lib/horse-marks-server";

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

export default async function Entries({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, picks, horseMap, names, user } = await loadGroupBoard(id);
  const marks = await groupBoardMarks(picks as { user_id: string; horse_id: string }[], user.id);
  const horseIds = picks.map((p) => p.horse_id as string);
  const owner = new Map(picks.map((p) => [p.horse_id as string, p.user_id as string]));
  const { data: entries } = horseIds.length
    ? await supabase
        .from("entries")
        .select("horse_id, race_id, race_date, venue, race_no, race_name, post_time")
        .in("horse_id", horseIds)
        .gte("race_date", todayJst())
        .order("race_date")
        .order("race_id")
    : { data: [] };

  const byDate = new Map<string, NonNullable<typeof entries>>();
  for (const e of entries ?? []) {
    byDate.set(e.race_date, [...(byDate.get(e.race_date) ?? []), e]);
  }

  return (
    <>
      {byDate.size > 0 && <MarkLegend />}
      {byDate.size === 0 && (
        <div className="card muted">今週出走予定の指名馬はいません。出走予定は毎週木〜土曜の夕方に更新されます。</div>
      )}
      {[...byDate].map(([date, list]) => {
        const d = new Date(`${date}T00:00:00Z`);
        return (
          <div key={date}>
            <div className="sec-title"><h2>{d.getUTCMonth() + 1}月{d.getUTCDate()}日（{WEEK[d.getUTCDay()]}）</h2><span className="muted">{list.length}頭</span></div>
            <div className="card flush">
              <table className="list">
                <tbody>
                  {list.map((e) => (
                    <tr key={`${e.horse_id}${e.race_id}`}>
                      <td style={{ whiteSpace: "nowrap" }}><span className="big">{e.venue}{e.race_no}R</span><div className="sub">{e.post_time ?? ""}</div></td>
                      <td>
                        <HorseLabel id={e.horse_id} horse={horseMap.get(e.horse_id)} groupId={id} showPed={false} marks={marks} />
                        <div className="sub">
                          <a href={shutubaUrl(e.race_id)} target="_blank" rel="noreferrer">{e.race_name ?? "出馬表"}</a>
                        </div>
                      </td>
                      <td className="muted" style={{ textAlign: "right" }}>{names.get(owner.get(e.horse_id) ?? "") ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </>
  );
}
