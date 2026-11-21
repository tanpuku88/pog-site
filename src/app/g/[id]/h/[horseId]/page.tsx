import Link from "next/link";
import { notFound } from "next/navigation";
import { requireGroup } from "@/lib/group-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { countsForRules } from "@/lib/standings";
import { horsePageUrl, shutubaUrl } from "@/lib/netkeiba/fetch";
import { formatMan, todayJst } from "@/lib/util";
import { Finish } from "@/components/HorseLabel";
import QuickPick from "../../popular/QuickPick";

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

export default async function HorsePage({ params }: { params: Promise<{ id: string; horseId: string }> }) {
  const { id, horseId } = await params;
  const { supabase, group } = await requireGroup(id);

  const [{ data: horse }, { data: results }, { data: entries }, { data: pick }] = await Promise.all([
    supabase.from("horses").select("*").eq("id", horseId).maybeSingle(),
    supabase.from("race_results").select("*").eq("horse_id", horseId).order("race_date", { ascending: false }),
    supabase.from("entries").select("*").eq("horse_id", horseId).gte("race_date", todayJst()).order("race_date"),
    supabase.from("picks").select("user_id").eq("group_id", id).eq("horse_id", horseId).maybeSingle(),
  ]);
  if (!horse) notFound();

  const { count: siteWide } = await createAdminClient()
    .from("picks").select("horse_id", { count: "exact", head: true }).eq("horse_id", horseId);
  const { data: picker } = pick
    ? await supabase.from("profiles").select("display_name").eq("id", pick.user_id).maybeSingle()
    : { data: null };

  const rows = (results ?? []).map((r) => ({ ...r, prize_man: Number(r.prize_man) }));
  const counted = rows.filter((r) => countsForRules(r, group));
  const points = Math.round(counted.reduce((s, r) => s + r.prize_man, 0) * 10) / 10;
  const wins = counted.filter((r) => r.finish === "1").length;
  const allWins = rows.filter((r) => r.finish === "1").length;

  const prof: [string, string | null][] = [
    ["生年", horse.birth_year ? `${horse.birth_year}年` : null],
    ["調教師", horse.trainer],
    ["馬主", horse.owner],
    ["生産者", horse.breeder],
  ];

  return (
    <>
      <p className="muted" style={{ margin: "0 0 8px" }}><Link href={`/g/${id}`}>‹ ランキングへ戻る</Link></p>
      <div className="card" style={{ borderLeft: "4px solid var(--accent)" }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0 }}>
              {horse.name}
              {horse.sex && <span className={`sex sex-${horse.sex}`} style={{ fontSize: 13, verticalAlign: 4 }}>{horse.sex}</span>}
            </h1>
            <div className="ped" style={{ fontSize: 13 }}>
              {horse.sire && <>父 <Link href={`/sires/${encodeURIComponent(horse.sire)}`} className="sire-link"><b>{horse.sire}</b></Link></>}
              {horse.dam && <>　母 <b>{horse.dam}</b></>}
              {horse.damsire && <>（母父 {horse.damsire}）</>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            {pick ? (
              <span className="pill">{picker?.display_name ?? "名無し"}さんが指名中</span>
            ) : (
              <QuickPick groupId={id} horseId={horseId} />
            )}
            <div className="muted" style={{ marginTop: 4 }}>
              <a href={horsePageUrl(horseId)} target="_blank" rel="noreferrer">netkeibaで見る ›</a>
            </div>
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><div className="k">この大会の賞金</div><div className="v">{formatMan(points)}<small>万円</small></div></div>
        <div className="stat"><div className="k">通算成績</div><div className="v">{rows.length}<small>戦</small>{allWins}<small>勝</small></div><div className="s">大会期間中 {counted.length}戦{wins}勝</div></div>
        <div className="stat"><div className="k">サイト全体の指名数</div><div className="v">{siteWide ?? 0}<small>グループ</small></div></div>
      </div>

      <div className="sec-title"><h2>プロフィール</h2></div>
      <div className="card flush">
        <table className="list">
          <tbody>
            {prof.map(([k, v]) => (
              <tr key={k}><th style={{ width: "7em", background: "var(--th)" }}>{k}</th><td>{v ?? <span className="muted">-</span>}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {(entries ?? []).length > 0 && (
        <>
          <div className="sec-title"><h2>出走予定</h2></div>
          <div className="card flush">
            <table className="list">
              <tbody>
                {(entries ?? []).map((e) => {
                  const d = new Date(`${e.race_date}T00:00:00+09:00`);
                  return (
                    <tr key={e.race_id}>
                      <td className="feed-date">{d.getMonth() + 1}/{d.getDate()}（{WEEK[d.getDay()]}）</td>
                      <td><span className="big">{e.venue}{e.race_no}R</span> <a href={shutubaUrl(e.race_id)} target="_blank" rel="noreferrer">{e.race_name ?? "出馬表"}</a></td>
                      <td className="num sub">{e.post_time ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="sec-title"><h2>競走成績</h2><span className="muted">賞金は本賞金（万円）</span></div>
      {rows.length === 0 ? (
        <div className="card muted">まだレースに出ていません。</div>
      ) : (
        <div className="card flush scroll">
          <table className="list compact">
            <thead><tr><th>日付</th><th>開催</th><th>レース</th><th className="c">着順</th><th className="num">賞金</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.race_date}${r.race_name}`}>
                  <td className="feed-date">{r.race_date.replaceAll("-", "/")}</td>
                  <td>{r.venue}</td>
                  <td>{r.race_name}{!countsForRules(r, group) && <span className="muted">（対象外）</span>}</td>
                  <td className="c"><Finish finish={r.finish} /></td>
                  <td className="num">{r.prize_man > 0 ? formatMan(r.prize_man) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
