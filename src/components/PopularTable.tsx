import Link from "next/link";
import type { ReactNode } from "react";
import type { PopularRow, BoardSex, BoardSort, GenerationBoard } from "@/lib/popular";
import { popularSires, risingHorses } from "@/lib/popular";
import { formatMan } from "@/lib/util";
import { HorseLabel, Rank } from "./HorseLabel";

/** 前週の順位との比較 */
export function RankChange({ rank, prev }: { rank: number; prev: number | null }) {
  if (prev === null) return <span className="chg chg-new">NEW</span>;
  if (prev > rank) return <span className="chg chg-up">↑{prev - rank}</span>;
  if (prev < rank) return <span className="chg chg-down">↓{rank - prev}</span>;
  return <span className="chg chg-same">→</span>;
}

/** 人気馬ランキングの表（トップ・公開ページ・大会の中で共通） */
export function PopularTable({ rows, sort = "picks", groupCount, groupId, actions, compact = false }: {
  rows: PopularRow[];
  sort?: BoardSort;
  groupCount: number;
  groupId?: string;
  /** 馬ごとに名前の下へ出すボタンなど */
  actions?: Record<string, ReactNode>;
  compact?: boolean;
}) {
  const maxPicks = Math.max(1, ...rows.map((r) => r.picks));
  const showChange = sort === "picks";
  return (
    <div className="card flush scroll">
      <table className={`list rank-table${compact ? " compact" : ""}`}>
        <thead>
          <tr>
            <th className="c">順位</th>
            {showChange && <th className="c hide-sm">前週</th>}
            <th>馬名・血統</th>
            <th className="num">指名数</th>
            {!compact && <th className="num hide-sm">指名率</th>}
            {!compact && showChange && <th className="num hide-sm">今週</th>}
            <th className="c hide-sm">成績</th>
            <th className="num">賞金<small>(万円)</small></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.horse.id} className={r.rank <= 3 ? `top${r.rank}` : undefined}>
              <td className="c rank-cell">
                <Rank rank={r.rank} />
                {showChange && <div className="show-sm"><RankChange rank={r.rank} prev={r.prevRank} /></div>}
              </td>
              {showChange && <td className="c hide-sm"><RankChange rank={r.rank} prev={r.prevRank} /></td>}
              <td className="name-cell">
                <HorseLabel id={r.horse.id} horse={r.horse} groupId={groupId} showTrainer={!compact} />
                {actions?.[r.horse.id] && <div style={{ marginTop: 3 }}>{actions[r.horse.id]}</div>}
              </td>
              <td className="num picks-cell">
                {r.picks > 0 ? <>
                  <span className="big">{r.picks}</span>
                  <div className="bar"><span style={{ width: `${(r.picks / maxPicks) * 100}%` }} /></div>
                </> : <span className="muted">-</span>}
              </td>
              {!compact && <td className="num hide-sm">{groupCount > 0 && r.picks > 0 ? `${Math.round((r.picks / groupCount) * 1000) / 10}%` : <span className="muted">-</span>}</td>}
              {!compact && showChange && <td className="num hide-sm">{r.weekPicks > 0 ? <span className="chg-up">+{r.weekPicks}</span> : <span className="muted">-</span>}</td>}
              <td className="c hide-sm sub">{r.starts === 0 ? "未出走" : `${r.starts}戦${r.wins}勝`}</td>
              <td className="num big">{r.points > 0 ? formatMan(r.points) : <span className="muted">-</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 絞り込み（総合・牡馬・牝馬）と並べ替え（指名数・賞金）の切り替え */
export function BoardFilters({ base, sex, sort, defaultSort = "picks" }: { base: string; sex: BoardSex; sort: BoardSort; defaultSort?: BoardSort }) {
  const href = (s: BoardSex, o: BoardSort) => {
    const q = new URLSearchParams();
    if (s !== "all") q.set("sex", s === "牡" ? "colt" : "filly");
    if (o !== defaultSort) q.set("sort", o);
    const qs = q.toString();
    return qs ? `${base}?${qs}` : base;
  };
  return (
    <div className="filters">
      <div className="seg">
        {(["all", "牡", "牝"] as BoardSex[]).map((s) => (
          <Link key={s} href={href(s, sort)} className={s === sex ? "on" : ""}>{s === "all" ? "総合" : s === "牡" ? "牡馬" : "牝馬"}</Link>
        ))}
      </div>
      <div className="seg">
        <Link href={href(sex, "prize")} className={sort === "prize" ? "on" : ""}>注目馬（賞金順）</Link>
        <Link href={href(sex, "picks")} className={sort === "picks" ? "on" : ""}>指名数順</Link>
      </div>
    </div>
  );
}

export function parseBoardParams(sp: { sex?: string; sort?: string }, defaultSort: BoardSort = "picks") {
  const sex: BoardSex = sp.sex === "colt" ? "牡" : sp.sex === "filly" ? "牝" : "all";
  const sort: BoardSort = sp.sort === "prize" || sp.sort === "picks" ? sp.sort : defaultSort;
  return { sex, sort };
}

/** 数字のタイル（集計した大会・のべ指名・指名された馬・今週の指名） */
export function BoardStats({ board }: { board: GenerationBoard }) {
  return (
    <div className="stats">
      <div className="stat"><div className="k">集計した大会</div><div className="v">{board.groupCount.toLocaleString()}<small>大会</small></div></div>
      <div className="stat"><div className="k">のべ指名</div><div className="v">{board.totalPicks.toLocaleString()}<small>頭</small></div></div>
      <div className="stat"><div className="k">指名された馬</div><div className="v">{board.totalHorses.toLocaleString()}<small>頭</small></div></div>
      <div className="stat"><div className="k">この7日の指名</div><div className="v">{board.weekPicks.toLocaleString()}<small>頭</small></div></div>
    </div>
  );
}

/** 横の欄：今週の急上昇 */
export function RisingBox({ board, groupId }: { board: GenerationBoard; groupId?: string }) {
  const rows = risingHorses(board.rows, 5);
  return (
    <section className="box">
      <h3 className="box-head">🔥 今週の急上昇<small>直近7日の指名</small></h3>
      {rows.length === 0 ? <p className="box-empty">この7日の指名はまだありません。</p> : (
        <ol className="mini-rank">
          {rows.map((r, i) => (
            <li key={r.horse.id}>
              <span className="mr-no">{i + 1}</span>
              <span className="mr-main"><HorseLabel id={r.horse.id} horse={r.horse} groupId={groupId} showPed={false} /><span className="mr-sub">父 {r.horse.sire ?? "-"}</span></span>
              <span className="mr-val chg-up">+{r.weekPicks}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** 横の欄：人気の種牡馬（産駒の指名数の合計） */
export function SireBox({ board, limit = 10 }: { board: GenerationBoard; limit?: number }) {
  const rows = popularSires(board.rows, limit);
  return (
    <section className="box">
      <h3 className="box-head">🧬 人気の種牡馬<small>産駒の指名数</small></h3>
      {rows.length === 0 ? <p className="box-empty">まだ指名がありません。</p> : (
        <ol className="mini-rank">
          {rows.map((r) => (
            <li key={r.sire}>
              <span className={`mr-no rk-${r.rank}`}>{r.rank}</span>
              <span className="mr-main">
                <Link href={`/sires/${encodeURIComponent(r.sire)}`} className="horse-name">{r.sire}</Link>
                <span className="mr-sub">{r.horses}頭・筆頭 {r.top.horse.name}</span>
              </span>
              <span className="mr-val">{r.picks}</span>
            </li>
          ))}
        </ol>
      )}
      <Link href="/sires?sort=picks" className="box-more">種牡馬ランキングを見る ›</Link>
    </section>
  );
}

/** 全国のPOG指名ランキングへの案内（転載はせずリンクだけ） */
export function ExternalRankingNote() {
  return (
    <p className="ext-note">
      全国のPOGプレイヤーの指名数ランキングは
      <a href="https://jra-van.jp/pog/" target="_blank" rel="noreferrer">JRA-VAN POG</a>
      で見られます（外部サイト）。
    </p>
  );
}

export function boardTitle(sex: BoardSex, sort: BoardSort) {
  const s = sex === "牡" ? "牡馬 " : sex === "牝" ? "牝馬 " : "";
  return sort === "prize" ? `${s}注目馬30傑（賞金順）` : `${s}注目馬30傑（指名数順）`;
}
