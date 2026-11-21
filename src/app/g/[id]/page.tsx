import Link from "next/link";
import { loadGroupBoard } from "@/lib/group-data";
import { inviteMessage } from "@/lib/invite";
import { siteOrigin } from "@/lib/site-origin";
import InviteShare from "@/components/InviteShare";
import { formatMan } from "@/lib/util";
import { HorseLabel, Finish, Rank } from "@/components/HorseLabel";

export default async function Ranking({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ joined?: string }> }) {
  const { id } = await params;
  const { joined } = await searchParams;
  const { standings, names, user, horseMap, results, picks, group } = await loadGroupBoard(id);
  const myPicks = picks.filter((p) => p.user_id === user.id).length;
  const inviteUrl = standings.length < 3 ? `${await siteOrigin()}/join/${group.invite_code}` : null;
  const lastFetched = [...horseMap.values()]
    .map((h) => h.results_fetched_at)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);

  const owner = new Map(picks.map((p) => [p.horse_id as string, p.user_id as string]));
  const me = standings.find((s) => s.user_id === user.id);
  const leader = standings[0];
  const allHorses = standings.flatMap((s) => s.horses);
  const topHorse = [...allHorses].sort((a, b) => b.points - a.points)[0];
  const weekTop = [...allHorses].sort((a, b) => b.weekPoints - a.weekPoints)[0];
  const winners = allHorses.filter((h) => h.wins > 0).length;

  // 最新の成績（新しい順に12件）。初勝利は「勝ち上がり」と表示する
  const firstWin = new Map<string, string>();
  for (const r of [...results].sort((a, b) => a.race_date.localeCompare(b.race_date))) {
    if (r.finish === "1" && !firstWin.has(r.horse_id)) firstWin.set(r.horse_id, r.race_date);
  }
  const feed = results.slice(0, 12);

  return (
    <>
      {joined && (
        <div className="card" style={{ borderLeft: "4px solid var(--gold)" }}>
          <strong>「{group.name}」に参加しました！</strong>
          <div className="muted" style={{ margin: "4px 0 8px" }}>{myPicks === 0 ? `さっそく馬を指名しましょう（1人${group.picks_per_member}頭まで）。` : `指名済み ${myPicks}/${group.picks_per_member}頭`}</div>
          <Link href={`/g/${id}/picks`} className="btn">馬を指名する</Link>
        </div>
      )}
      {inviteUrl && (
        <div className="card">
          <strong>仲間を招待しましょう</strong>
          <div className="muted" style={{ margin: "4px 0 8px" }}>参加者はいま{standings.length}人です。リンクを送るだけで参加できます。</div>
          <InviteShare url={inviteUrl} message={inviteMessage(group.name, inviteUrl)} />
        </div>
      )}
      <div className="stats">
        <div className="stat">
          <div className="k">首位</div>
          <div className="v">{leader && leader.points > 0 ? formatMan(leader.points) : "-"}<small>万円</small></div>
          <div className="s">{leader && leader.points > 0 ? names.get(leader.user_id) : "まだ賞金なし"}</div>
        </div>
        <div className="stat">
          <div className="k">自分の順位</div>
          <div className="v">{me ? me.rank : "-"}<small>位 / {standings.length}人</small></div>
          <div className="s">{me ? `${formatMan(me.points)}万円` : ""}</div>
        </div>
        <div className="stat">
          <div className="k">稼ぎ頭</div>
          <div className="v">{topHorse && topHorse.points > 0 ? formatMan(topHorse.points) : "-"}<small>万円</small></div>
          <div className="s">{topHorse && topHorse.points > 0 ? horseMap.get(topHorse.horse_id)?.name : "まだいません"}</div>
        </div>
        <div className="stat">
          <div className="k">勝ち上がり</div>
          <div className="v">{winners}<small>頭 / {allHorses.length}頭</small></div>
          <div className="s">{weekTop && weekTop.weekPoints > 0 ? `今週の主役：${horseMap.get(weekTop.horse_id)?.name}` : "今週の獲得はまだなし"}</div>
        </div>
      </div>

      <div className="sec-title"><h2>順位表</h2><span className="muted">本賞金（万円）の合計</span></div>
      <div className="card flush scroll">
        <table className="list">
          <thead>
            <tr>
              <th className="c">順位</th>
              <th>参加者</th>
              <th className="num">賞金</th>
              <th className="num hide-sm">今週</th>
              <th className="num">勝利</th>
              <th className="num hide-sm">出走頭数</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => (
              <tr key={s.user_id}>
                <td className="c"><Rank rank={s.rank} /></td>
                <td>
                  <Link className="big" href={`/g/${id}/m/${s.user_id}`}>{names.get(s.user_id) ?? "名無し"}</Link>
                  {s.user_id === user.id && <span className="pill" style={{ marginLeft: 6 }}>自分</span>}
                  <div className="sub">{s.horses.length}頭指名</div>
                </td>
                <td className="num big">{formatMan(s.points)}</td>
                <td className="num hide-sm">{s.weekPoints > 0 ? <span className="up">+{formatMan(s.weekPoints)}</span> : <span className="muted">-</span>}</td>
                <td className="num">{s.wins}</td>
                <td className="num hide-sm">{s.horses.filter((h) => h.starts > 0).length}/{s.horses.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sec-title"><h2>最新の成績</h2><span className="muted">指名馬のレース結果</span></div>
      {feed.length === 0 ? (
        <div className="card muted">まだレース結果がありません。指名馬がレースに出ると、ここに結果が並びます。</div>
      ) : (
        <div className="card flush scroll">
          <table className="list compact">
            <thead>
              <tr><th>日付</th><th>馬名</th><th>レース</th><th className="c">着順</th><th className="num">賞金</th><th className="hide-sm">指名者</th></tr>
            </thead>
            <tbody>
              {feed.map((r) => (
                <tr key={`${r.horse_id}${r.race_date}${r.race_name}`}>
                  <td className="feed-date">{r.race_date.slice(5).replace("-", "/")}</td>
                  <td>
                    <HorseLabel id={r.horse_id} horse={horseMap.get(r.horse_id)} groupId={id} showPed={false} />
                    {firstWin.get(r.horse_id) === r.race_date && <span className="pill hot" style={{ marginLeft: 6 }}>勝ち上がり</span>}
                  </td>
                  <td>{r.venue} {r.race_name}</td>
                  <td className="c"><Finish finish={r.finish} /></td>
                  <td className="num">{r.prize_man > 0 ? formatMan(r.prize_man) : ""}</td>
                  <td className="hide-sm sub">{names.get(owner.get(r.horse_id) ?? "") ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="muted">
        「今週」は直近7日間の増加分です。
        {lastFetched && <> 成績の最終更新：{new Date(lastFetched).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</>}
      </p>
    </>
  );
}
