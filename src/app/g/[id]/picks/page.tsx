import { loadGroupBoard } from "@/lib/group-data";
import { HorseTable } from "../HorseTable";
import PickForm from "./PickForm";
import { formatMan } from "@/lib/util";
import RemoveButton from "./RemoveButton";
import ShareCard from "@/components/ShareCard";
import { myListShareText } from "@/lib/share";
import { loadPopularIds } from "@/lib/horse-marks-server";
import { MarkLegend } from "@/components/HorseLabel";

export default async function MyPicks({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { standings, user, group, horseMap, results } = await loadGroupBoard(id);
  const popular = await loadPopularIds();
  const me = standings.find((s) => s.user_id === user.id);
  const count = me?.horses.length ?? 0;
  const remaining = group.picks_per_member - count;
  return (
    <>
      <div className="card">
        <strong>馬を追加</strong>
        <span className="muted">（あと{remaining}頭 / {group.picks_per_member}頭）</span>
        {remaining > 0 ? <PickForm groupId={id} /> : <p className="muted">指名頭数の上限に達しています。</p>}
      </div>
      <div className="sec-title"><h2>自分の指名馬（{count}頭）</h2><span className="muted">合計 {formatMan(me?.points ?? 0)} 万円</span></div>
      {count > 0 && <MarkLegend kinds={["local", "popular"]} />}
      <HorseTable
        groupId={id}
        marks={{ popular }}
        scores={me?.horses ?? []}
        horseMap={horseMap}
        results={results}
        includeNonJra={group.include_non_jra} slots={group.picks_per_member}
        actions={(horseId) => <RemoveButton groupId={id} horseId={horseId} name={horseMap.get(horseId)?.name ?? ""} />}
      />
      {me && count > 0 && (
        <ShareCard
          groupId={id}
          who={user.id}
          title="指名リストをシェア"
          note="自分の指名馬と順位が画像になり、Xに画像付きで投稿できます。招待リンクは載りません。"
          text={myListShareText(group.name, me, standings.length, horseMap)}
        />
      )}
    </>
  );
}
