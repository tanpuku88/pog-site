import Link from "next/link";
import { requireGroup } from "@/lib/group-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadGenerationBoard } from "@/lib/popular";
import { formatMan } from "@/lib/util";
import { HorseLabel, Rank } from "@/components/HorseLabel";
import QuickPick from "./QuickPick";

export default async function Popular({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { id } = await params;
  const { sort } = await searchParams;
  const byPrizeMode = sort === "prize";
  const { group, supabase } = await requireGroup(id);
  const board = await loadGenerationBoard(createAdminClient(), group.crop_year, group);
  const rows = byPrizeMode ? board.byPrize : board.byPicks;
  const maxPicks = Math.max(1, ...board.byPicks.map((r) => r.picks));

  // 自分のグループで誰が指名しているか
  const { data: myPicks } = await supabase.from("picks").select("horse_id").eq("group_id", id);
  const inGroup = new Set((myPicks ?? []).map((p) => p.horse_id as string));

  return (
    <>
      <div className="sec-title">
        <h2>{group.crop_year}年生まれ世代 {byPrizeMode ? "賞金ランキング" : "人気馬30傑"}</h2>
        <div className="seg">
          <Link href={`/g/${id}/popular`} className={byPrizeMode ? "" : "on"}>指名数順</Link>
          <Link href={`/g/${id}/popular?sort=prize`} className={byPrizeMode ? "on" : ""}>賞金順</Link>
        </div>
      </div>
      <p className="muted" style={{ marginTop: 0 }}>
        このサイトの全グループで指名された{board.totalHorses}頭（のべ{board.totalPicks}指名）から集計しています。
        {byPrizeMode ? "賞金はこの大会のルール（期間・対象）で数えています。" : "同じ指名数のときは賞金が多い順です。"}
      </p>

      {rows.length === 0 ? (
        <div className="card muted">{byPrizeMode ? "まだ賞金を獲得した馬がいません。" : "まだ指名された馬がいません。"}</div>
      ) : (
        <div className="card flush scroll">
          <table className="list">
            <thead>
              <tr>
                <th className="c">順位</th>
                <th>馬名・血統</th>
                <th className="num">指名数</th>
                <th className="num">賞金</th>
                <th className="num hide-sm">成績</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.horse.id}>
                  <td className="c"><Rank rank={r.rank} /></td>
                  <td>
                    <HorseLabel id={r.horse.id} horse={r.horse} />
                    <div style={{ marginTop: 2 }}>
                      {inGroup.has(r.horse.id)
                        ? <span className="pill">この大会で指名済み</span>
                        : <QuickPick groupId={id} horseId={r.horse.id} />}
                    </div>
                  </td>
                  <td className="num">
                    <span className="big">{r.picks}</span>
                    {!byPrizeMode && <div className="bar" style={{ marginTop: 4 }}><span style={{ width: `${(r.picks / maxPicks) * 100}%` }} /></div>}
                  </td>
                  <td className="num big">{r.points > 0 ? formatMan(r.points) : <span className="muted">-</span>}</td>
                  <td className="num hide-sm sub">{r.starts === 0 ? "未出走" : `${r.starts}戦${r.wins}勝`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
