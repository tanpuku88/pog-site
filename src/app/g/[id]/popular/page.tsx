import { requireGroup } from "@/lib/group-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadGenerationBoard, rankBoard } from "@/lib/popular";
import { PopularTable, BoardFilters, BoardStats, RisingBox, SireBox, parseBoardParams, boardTitle, ExternalRankingNote, boardPopularIds } from "@/components/PopularTable";
import { MarkLegend } from "@/components/HorseLabel";
import { OwnerSide } from "@/components/OwnerSites";
import QuickPick from "./QuickPick";

export default async function Popular({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sex?: string; sort?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { group, supabase, user } = await requireGroup(id);
  const board = await loadGenerationBoard(createAdminClient(), group.crop_year, group);
  const { sex, sort } = parseBoardParams(sp, board.defaultSort);
  const rows = rankBoard(board.rows, { sex, sort, limit: 30 });

  // 自分の大会で指名済みかどうか
  const { data: groupPicks } = await supabase.from("picks").select("horse_id, user_id").eq("group_id", id);
  const inGroup = new Set((groupPicks ?? []).map((p) => p.horse_id as string));
  const mine = new Set((groupPicks ?? []).filter((p) => p.user_id === user.id).map((p) => p.horse_id as string));
  const marks = { popular: boardPopularIds(board), mine, taken: new Set([...inGroup].filter((h) => !mine.has(h))) };
  const actions = Object.fromEntries(rows.map((r) => [
    r.horse.id,
    inGroup.has(r.horse.id) ? <span className="pill">この大会で指名済み</span> : <QuickPick groupId={id} horseId={r.horse.id} />,
  ]));

  return (
    <>
      <div className="sec-title">
        <h2>{group.crop_year}年生まれ世代 {boardTitle(sex, sort)}</h2>
        <span className="muted">全大会の指名を集計・賞金はこの大会のルール</span>
      </div>
      <BoardStats board={board} />
      <div className="layout-2col">
        <div>
          <BoardFilters base={`/g/${id}/popular`} sex={sex} sort={sort} defaultSort={board.defaultSort} />
          {rows.length === 0 ? (
            <div className="card muted">{sort === "prize" ? "まだ賞金を獲得した馬がいません。" : "まだ指名された馬がいません。"}</div>
          ) : (
            <>
              <MarkLegend kinds={["local", "mine", "taken", "popular"]} />
              <PopularTable rows={rows} sort={sort} groupCount={board.groupCount} groupId={id} actions={actions} marks={marks} />
            </>
          )}
          <ExternalRankingNote />
        </div>
        <aside className="side">
          <RisingBox board={board} groupId={id} marks={marks} />
          <SireBox board={board} />
          <OwnerSide />
        </aside>
      </div>
    </>
  );
}
