import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { countPicks } from "@/lib/popular";
import { shutubaUrl } from "@/lib/netkeiba/fetch";
import { todayJst } from "@/lib/util";
import { HorseLabel } from "@/components/HorseLabel";
import { Columns } from "@/components/HomeSections";

export const metadata = { title: "今週の新馬戦 | POG" };

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

type Entry = { horse_id: string; race_id: string; race_date: string; venue: string | null; race_no: number | null; race_name: string | null; post_time: string | null };
type Horse = { id: string; name: string; sex: string | null; sire: string | null; dam: string | null; damsire: string | null; trainer: string | null; owner: string | null };

export default async function Shinba() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entries")
    .select("horse_id, race_id, race_date, venue, race_no, race_name, post_time")
    .like("race_name", "%新馬%")
    .gte("race_date", todayJst())
    .order("race_date")
    .order("race_id");
  const entries = (data ?? []) as Entry[];

  const ids = [...new Set(entries.map((e) => e.horse_id))];
  const { data: horses } = ids.length
    ? await supabase.from("horses").select("id, name, sex, sire, dam, damsire, trainer, owner").in("id", ids)
    : { data: [] };
  const horseMap = new Map(((horses ?? []) as Horse[]).map((h) => [h.id, h]));

  // サイト全体の指名数（誰が指名したかは出さない）
  let picks = new Map<string, number>();
  if (ids.length) {
    try {
      const { data: p } = await createAdminClient().from("picks").select("horse_id").in("horse_id", ids);
      picks = countPicks((p ?? []).map((r) => r.horse_id as string));
    } catch {
      picks = new Map();
    }
  }

  // 日付 → レース にまとめる
  const days = new Map<string, Map<string, Entry[]>>();
  for (const e of entries) {
    const races = days.get(e.race_date) ?? new Map<string, Entry[]>();
    races.set(e.race_id, [...(races.get(e.race_id) ?? []), e]);
    days.set(e.race_date, races);
  }

  return (
    <>
      <h1>今週の新馬戦</h1>
      <p className="muted" style={{ marginTop: -8 }}>
        JRAの新馬戦に出走する馬の一覧です。出馬表が出る木曜〜土曜の夕方に更新します。指名数はこのサイトの全グループの合計です。
      </p>
      {days.size === 0 && <div className="card muted">今週の新馬戦の出走馬はまだ出ていません。出馬表が確定する木曜の夕方以降に表示されます。</div>}
      {[...days].map(([date, races]) => {
        const d = new Date(`${date}T00:00:00+09:00`);
        return (
          <div key={date}>
            <div className="sec-title"><h2>{d.getMonth() + 1}月{d.getDate()}日（{WEEK[d.getDay()]}）</h2><span className="muted">{races.size}レース</span></div>
            {[...races].map(([raceId, list]) => {
              const r = list[0];
              return (
                <div className="card flush" key={raceId} style={{ marginBottom: 12 }}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <span><span className="big">{r.venue}{r.race_no}R</span> {r.race_name}{r.post_time && <span className="muted">　{r.post_time}発走</span>}</span>
                    <a className="muted" href={shutubaUrl(raceId)} target="_blank" rel="noreferrer">出馬表 ›</a>
                  </div>
                  <div className="scroll">
                    <table className="list compact">
                      <thead><tr><th>馬名・血統</th><th className="hide-sm">厩舎</th><th className="num">指名数</th></tr></thead>
                      <tbody>
                        {list.map((e) => {
                          const h = horseMap.get(e.horse_id);
                          const n = picks.get(e.horse_id) ?? 0;
                          return (
                            <tr key={e.horse_id}>
                              <td>
                                <HorseLabel id={e.horse_id} horse={h} />
                                {n >= 3 && <span className="pill hot" style={{ marginLeft: 6 }}>注目</span>}
                              </td>
                              <td className="hide-sm sub">{h?.trainer ?? ""}</td>
                              <td className="num">{n > 0 ? <span className="big">{n}</span> : <span className="muted">-</span>}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      <Columns />
      <p className="muted" style={{ textAlign: "center", marginTop: 24 }}><Link href="/">トップへ戻る</Link></p>
    </>
  );
}
