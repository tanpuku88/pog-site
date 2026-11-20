import { notFound } from "next/navigation";
import { loadGroupBoard } from "@/lib/group-data";
import { HorseTable } from "@/app/g/[id]/HorseTable";

export default async function MemberPage({ params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params;
  const { standings, names, horseMap, results, group } = await loadGroupBoard(id);
  const me = standings.find((s) => s.user_id === userId);
  if (!me) notFound();
  return (
    <>
      <h2 style={{ marginTop: 0 }}>{me.rank}位　{names.get(userId) ?? "名無し"}</h2>
      <HorseTable scores={me.horses} horseMap={horseMap} results={results} includeNonJra={group.include_non_jra} />
    </>
  );
}
