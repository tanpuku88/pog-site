import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { countPicks } from "@/lib/popular";
import { shutubaUrl } from "@/lib/netkeiba/fetch";
import { todayJst } from "@/lib/util";
import { HorseLabel, MarkLegend } from "@/components/HorseLabel";
import { loadHorseMarks } from "@/lib/horse-marks-server";
import { Columns } from "@/components/HomeSections";
import { sireData } from "@/lib/sire-data";
import { loadCropData } from "@/lib/sires";
import { computeMetrics, scoreProfiles } from "@/lib/profile";
import { defaultSeason } from "@/lib/standings";
import { rankShinbaRace, scoreShinbaHorse, shinbaHighlights, type ShinbaScore } from "@/lib/shinba-picks";
import { jockeyData } from "@/lib/jockey-data";

export const metadata = { title: "今週の新馬戦 | POG" };

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

type Entry = { horse_id: string; race_id: string; race_date: string; venue: string | null; race_no: number | null; race_name: string | null; post_time: string | null; jockey: string | null };
type Horse = { id: string; name: string; sex: string | null; sire: string | null; dam: string | null; damsire: string | null; trainer: string | null; owner: string | null };

export default async function Shinba() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entries")
    .select("horse_id, race_id, race_date, venue, race_no, race_name, post_time, jockey")
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

  const marks = ids.length ? await loadHorseMarks() : undefined;

  // 狙い目スコア（第2段階：騎手を追加）。父・母父は種牡馬データ（全産駒）から、
  // 厩舎は今の世代の集計から能力値を出す。厩舎側が取れなくても血統だけで計算する。
  // 騎手は出走ごとに違うので、スコアはレース×馬の単位で持つ。
  let trainerScores = new Map<string, { early: number | null; consistency: number | null }>();
  if (ids.length) {
    try {
      const season = defaultSeason();
      const crop = await loadCropData(createAdminClient(), season.crop_year, { ...season, include_non_jra: true });
      const profiles = scoreProfiles(computeMetrics(crop.horses, crop.tally, crop.races, "trainer"));
      trainerScores = new Map([...profiles].map(([name, p]) => [name, { early: p.scores.early, consistency: p.scores.consistency }]));
    } catch {
      trainerScores = new Map();
    }
  }
  const winnerRateOf = (name: string | null | undefined) => {
    if (!name) return null;
    const o = sireData(name)?.offspring;
    return o && o.runs >= 30 && o.winnerRate !== null ? o.winnerRate : null;
  };
  const scoreOf = new Map<string, ShinbaScore>();
  for (const e of entries) {
    const h = horseMap.get(e.horse_id);
    if (!h) continue;
    const t = h.trainer ? trainerScores.get(h.trainer) : undefined;
    const jd = jockeyData(e.jockey);
    scoreOf.set(`${e.race_id}:${e.horse_id}`, scoreShinbaHorse({
      sireWinnerRate: winnerRateOf(h.sire), sireName: h.sire,
      damsireWinnerRate: winnerRateOf(h.damsire), damsireName: h.damsire,
      trainerEarly: t?.early ?? null, trainerConsistency: t?.consistency ?? null, trainerName: h.trainer,
      jockeyName: e.jockey,
      jockeyDebut: jd ? { rides: jd.debutRides, wins: jd.debutWins, places: jd.debutPlaces } : null,
    }));
  }

  // 日付 → レース にまとめる
  const days = new Map<string, Map<string, Entry[]>>();
  for (const e of entries) {
    const races = days.get(e.race_date) ?? new Map<string, Entry[]>();
    races.set(e.race_id, [...(races.get(e.race_id) ?? []), e]);
    days.set(e.race_date, races);
  }

  // レースごとに狙い目を付け、全レースの上位をまとめる
  const pickIds = new Set<string>();
  const rankedRaces = [...days.values()].flatMap((races) =>
    [...races.values()].map((list) => rankShinbaRace(list, (e) => scoreOf.get(`${e.race_id}:${e.horse_id}`) ?? { score: null, reasons: [] })),
  );
  for (const r of rankedRaces.flat()) if (r.isPick) pickIds.add(`${r.item.race_id}:${r.item.horse_id}`);
  const highlights = shinbaHighlights(rankedRaces, 5);

  const totalRaces = [...days.values()].reduce((n, races) => n + races.size, 0);

  return (
    <>
      <section className="sb-hero" id="top">
        <p className="sb-kicker">SHINBA PICKS</p>
        <h1>今週の新馬戦</h1>
        <p className="sb-lead">中央・地方の新馬戦（門別のフレッシュチャレンジを含む）の出走馬を、血統・厩舎・騎手のデータでスコア化。出馬表が出たら毎日夕方に更新します。</p>
        <div className="sb-stats">
          <div className="sb-stat"><b>{totalRaces}</b><span>レース</span></div>
          <div className="sb-stat"><b>{entries.length}</b><span>出走馬</span></div>
          <div className="sb-stat"><b>{pickIds.size}</b><span>狙い目🎯</span></div>
          <div className="sb-stat"><b>{highlights[0]?.score.score ?? "-"}</b><span>最高スコア</span></div>
        </div>
        <div className="sb-factors" aria-label="スコアの材料">
          <span>父の勝ち上がり率</span><span>厩舎の仕上がり</span><span>厩舎の勝ち上がり</span><span>騎手の新馬戦成績</span><span>母父の勝ち上がり率</span>
        </div>
        <details className="sb-howto">
          <summary>スコアの見方</summary>
          <p>「狙い目」は上の5つの材料を100点満点で計算したスコアです。65点以上で、そのレースの上位2頭までが🎯になります。騎手が未定のうちは騎手なしで計算し、決まり次第反映します。指名数はこのサイトの全グループの合計です（誰が指名したかは表示しません）。</p>
        </details>
      </section>
      {highlights.length > 0 && (
        <section className="sb-picks-sec">
          <div className="sec-title"><h2>今週の狙い目 TOP{highlights.length}</h2><span className="muted">スコア順</span></div>
          <div className="sb-picks">
            {highlights.map((r, i) => {
              const h = horseMap.get(r.item.horse_id);
              const d = new Date(`${r.item.race_date}T00:00:00Z`);
              return (
                <article className={`sb-pick-card${i === 0 ? " is-top" : ""}`} key={`${r.item.race_id}:${r.item.horse_id}`}>
                  <div className="sb-pick-head">
                    <span className={`rk rk-${i + 1}`}>{i + 1}</span>
                    <span className="sb-pick-meta">{d.getUTCMonth() + 1}/{d.getUTCDate()}（{WEEK[d.getUTCDay()]}）{r.item.venue}{r.item.race_no}R{r.item.post_time ? ` ${r.item.post_time}` : ""}</span>
                  </div>
                  <Link className="sb-pick-name" href={`/horse/${r.item.horse_id}`}>{h?.name ?? r.item.horse_id}</Link>
                  <div className="sb-pick-sub">{h?.sire ? `父 ${h.sire}` : ""}{h?.trainer ? `　${h.trainer}厩舎` : ""}{r.item.jockey ? `　${r.item.jockey}騎手` : ""}</div>
                  <div className="sb-score-row">
                    <span className="sb-score-num">{r.score.score}<small>点</small></span>
                    <span className="progress sb-bar"><span style={{ width: `${r.score.score ?? 0}%` }} /></span>
                  </div>
                  {r.score.reasons.length > 0 && <p className="sb-reasons">{r.score.reasons.join("。")}。</p>}
                </article>
              );
            })}
          </div>
        </section>
      )}
      {days.size > 0 && (
        <nav className="race-jump" aria-label="レースへ移動">
          {[...days].map(([date, races]) => {
            const d = new Date(`${date}T00:00:00Z`);
            return (
              <div className="rj-day" key={date}>
                <span className="rj-date">{d.getUTCMonth() + 1}/{d.getUTCDate()}（{WEEK[d.getUTCDay()]}）</span>
                <div className="rj-list">
                  {[...races].map(([raceId, list]) => (
                    <a key={raceId} href={`#r-${raceId}`} className="rj-btn">
                      <b>{list[0].venue}{list[0].race_no}R</b>
                      {list[0].post_time && <small>{list[0].post_time}</small>}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      )}
      {days.size > 0 && <MarkLegend />}
      {days.size === 0 && <div className="card muted">今週の新馬戦の出走馬はまだ出ていません。出馬表が確定する木曜の夕方以降に表示されます。</div>}
      {[...days].map(([date, races]) => {
        const d = new Date(`${date}T00:00:00Z`);
        return (
          <div key={date}>
            <div className="sec-title"><h2>{d.getUTCMonth() + 1}月{d.getUTCDate()}日（{WEEK[d.getUTCDay()]}）</h2><span className="muted">{races.size}レース</span></div>
            {[...races].map(([raceId, list]) => {
              const r = list[0];
              return (
                <div className="card flush race-card" id={`r-${raceId}`} key={raceId} style={{ marginBottom: 12 }}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                    <span><span className="big">{r.venue}{r.race_no}R</span> {r.race_name}{r.post_time && <span className="muted">　{r.post_time}発走</span>}</span>
                    <span className="race-links">
                      <a className="muted" href={shutubaUrl(raceId)} target="_blank" rel="noreferrer">出馬表 ›</a>
                      <a className="muted" href="#top">↑ 上へ</a>
                    </span>
                  </div>
                  <div className="scroll">
                    <table className="list compact">
                      <thead><tr><th>馬名・血統</th><th className="hide-sm">厩舎</th><th className="hide-sm">騎手</th><th>狙い目</th><th className="num">指名数</th></tr></thead>
                      <tbody>
                        {list.map((e) => {
                          const h = horseMap.get(e.horse_id);
                          const n = picks.get(e.horse_id) ?? 0;
                          const s = scoreOf.get(`${e.race_id}:${e.horse_id}`);
                          const isPick = pickIds.has(`${e.race_id}:${e.horse_id}`);
                          return (
                            <tr key={e.horse_id} className={isPick ? "sb-pickrow" : undefined}>
                              <td>
                                <HorseLabel id={e.horse_id} horse={h} marks={marks} />
                              </td>
                              <td className="hide-sm sub">{h?.trainer ?? ""}</td>
                              <td className="hide-sm sub">{e.jockey ?? <span className="muted">未定</span>}</td>
                              <td className="sb-score-cell">
                                {!s || s.score === null ? <span className="muted">-</span> : (
                                  <>
                                    <span className="sb-score-line">
                                      <span className="sb-score-val">{s.score}<small>点</small></span>
                                      {isPick && <span className="sb-pick-pill">🎯 狙い目</span>}
                                    </span>
                                    <span className="progress sb-bar"><span style={{ width: `${s.score}%` }} /></span>
                                    {s.reasons.length > 0 && <span className="sb-reasons">{s.reasons.join("。")}。</span>}
                                  </>
                                )}
                              </td>
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
