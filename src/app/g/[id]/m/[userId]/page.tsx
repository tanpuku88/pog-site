import { notFound } from "next/navigation";
import { loadGroupBoard } from "@/lib/group-data";
import { HorseTable } from "@/app/g/[id]/HorseTable";
import { formatMan } from "@/lib/util";
import ShareCard from "@/components/ShareCard";
import { myListShareText } from "@/lib/share";
import { loadPopularIds } from "@/lib/horse-marks-server";
import { MarkLegend } from "@/components/HorseLabel";

export default async function MemberPage({ params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params;
  const { standings, names, horseMap, results, group, user } = await loadGroupBoard(id);
  const me = standings.find((s) => s.user_id === userId);
  if (!me) notFound();
  return (
    <>
      <div className="sec-title" style={{ marginTop: 0 }}><h2>{me.rank}位　{names.get(userId) ?? "名無し"}</h2><span className="muted">合計 {formatMan(me.points)} 万円・{me.wins}勝</span></div>
      <MarkLegend kinds={["local", "popular"]} />
      <HorseTable marks={{ popular: await loadPopularIds() }} groupId={id} scores={me.horses} horseMap={horseMap} results={results} includeNonJra={group.include_non_jra} slots={group.picks_per_member} />
      {userId === user.id && me.horses.length > 0 && (
        <ShareCard groupId={id} who={userId} title="指名リストをシェア" note="自分の指名馬と順位が画像になり、Xに画像付きで投稿できます。招待リンクは載りません。" text={myListShareText(group.name, me, standings.length, horseMap)} />
      )}
    </>
  );
}
