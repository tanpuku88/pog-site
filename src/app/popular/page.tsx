import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadGenerationBoard, rankBoard } from "@/lib/popular";
import { defaultSeason } from "@/lib/standings";
import { PopularTable, BoardFilters, BoardStats, RisingBox, SireBox, parseBoardParams, boardTitle, ExternalRankingNote } from "@/components/PopularTable";

const crop = defaultSeason().crop_year;

export const metadata: Metadata = {
  title: { absolute: `POG注目馬ランキング30傑｜${crop}年生まれ2歳馬` },
  description: `${crop}年生まれ2歳馬の注目馬30傑（賞金・勝ち数順）。POGでよく指名されている順にも切り替えられます。指名数・指名率・前週からの順位変動・賞金を毎日更新。牡馬・牝馬別、人気の種牡馬も。`,
  alternates: { canonical: "/popular" },
};

export default async function PopularPage({ searchParams }: { searchParams: Promise<{ sex?: string; sort?: string }> }) {
  const sp = await searchParams;
  const season = defaultSeason();
  let board: Awaited<ReturnType<typeof loadGenerationBoard>> | null = null;
  try {
    board = await loadGenerationBoard(createAdminClient(), season.crop_year, { ...season, include_non_jra: false });
  } catch {
    board = null;
  }
  const defaultSort = board?.defaultSort ?? "prize";
  const { sex, sort } = parseBoardParams(sp, defaultSort);
  const rows = board ? rankBoard(board.rows, { sex, sort, limit: 30 }) : [];

  return (
    <>
      <div className="page-head">
        <p className="crumb"><Link href="/">トップ</Link> › 注目馬30傑</p>
        <h1>{season.crop_year}年生まれ世代 {boardTitle(sex, sort)}</h1>
        <p className="muted">
          {sort === "prize"
            ? "取り込み済みの2歳馬すべてを、今シーズンの中央の本賞金・勝ち数の順に並べています（毎日更新）。指名数はこのサイトの全大会の合計です。"
            : "このサイトのすべての大会の指名を集計しています（毎日更新・中央の本賞金）。前週は7日前の順位との比較です。"}
        </p>
      </div>
      {board && <BoardStats board={board} />}
      <div className="layout-2col">
        <div>
          <BoardFilters base="/popular" sex={sex} sort={sort} defaultSort={defaultSort} />
          {rows.length === 0 ? (
            <div className="card muted">{sort === "prize" ? "まだ賞金を獲得した馬がいません。" : "まだ指名された馬がいません。大会を作って最初の指名をしてみましょう。"}</div>
          ) : (
            <PopularTable rows={rows} sort={sort} groupCount={board?.groupCount ?? 0} />
          )}
          <ExternalRankingNote />
          <div className="cta-band">
            <span><strong>この30頭、仲間は何頭指名する？</strong><br /><span className="muted">大会は無料・招待リンクを送るだけ。</span></span>
            <Link href="/login?mode=signup" className="btn gold">無料で大会を作る</Link>
          </div>
        </div>
        {board && (
          <aside className="side">
            <RisingBox board={board} />
            <SireBox board={board} />
          </aside>
        )}
      </div>
    </>
  );
}
