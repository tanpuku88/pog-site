import Link from "next/link";
import { loadGroupBoard } from "@/lib/group-data";
import { formatMan } from "@/lib/util";

export default async function Ranking({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { standings, names, user, horseMap } = await loadGroupBoard(id);
  const lastFetched = [...horseMap.values()]
    .map((h) => h.results_fetched_at)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);

  return (
    <>
      <div className="card" style={{ padding: "8px 12px" }}>
        <table className="list">
          <thead>
            <tr>
              <th>順位</th>
              <th>参加者</th>
              <th className="num">ポイント</th>
              <th className="num">勝利</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => (
              <tr key={s.user_id}>
                <td className={`rank rank-${s.rank}`}>{s.rank}</td>
                <td>
                  <Link href={`/g/${id}/m/${s.user_id}`}>{names.get(s.user_id) ?? "名無し"}</Link>
                  {s.user_id === user.id && <span className="pill" style={{ marginLeft: 6 }}>自分</span>}
                  <div className="muted" style={{ fontSize: 12 }}>{s.horses.length}頭指名</div>
                </td>
                <td className="num">
                  {formatMan(s.points)}
                  {s.weekPoints > 0 && <div className="up">+{formatMan(s.weekPoints)}</div>}
                </td>
                <td className="num">{s.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">
        ポイントは本賞金（万円）の合計です。緑の数字は直近7日間の増加分です。
        {lastFetched && <> 成績の最終更新：{new Date(lastFetched).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</>}
      </p>
    </>
  );
}
