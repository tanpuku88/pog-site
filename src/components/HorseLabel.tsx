import Link from "next/link";
import { marksFor, POPULAR_MIN_PICKS, POPULAR_TOP, type HorseMarks, type MarkKind } from "@/lib/horse-marks";

type H = { id: string; name: string; sex?: string | null; sire?: string | null; dam?: string | null; damsire?: string | null; trainer?: string | null };

/** 馬名＋性別バッジ＋血統の1セル */
export function HorseLabel({ horse, id, groupId, showPed = true, showTrainer = false, marks }: { horse?: H; id: string; groupId?: string; showPed?: boolean; showTrainer?: boolean; marks?: HorseMarks }) {
  return (
    <>
      {groupId
        ? <Link className="horse-name" href={`/g/${groupId}/h/${id}`}>{horse?.name ?? id}</Link>
        : <Link className="horse-name" href={`/horse/${id}`}>{horse?.name ?? id}</Link>}
      {horse?.sex && <span className={`sex sex-${horse.sex}`}>{horse.sex}</span>}
      <MarkBadges id={id} trainer={horse?.trainer} marks={marks} />
      {showPed && (horse?.sire || horse?.dam) && (
        <div className="ped">
          {horse?.sire && <span className="ped-sire">父 <Link href={`/sires/${encodeURIComponent(horse.sire)}`} className="sire-link"><b>{horse.sire}</b></Link></span>}
          {horse?.dam && <span className="ped-dam">　母 <b>{horse.dam}</b></span>}
          {horse?.damsire && <span className="ped-damsire">（母父 {horse.damsire}）</span>}
          {showTrainer && horse?.trainer && <span className="ped-trainer">　{horse.trainer}</span>}
        </div>
      )}
    </>
  );
}

/** 着順バッジ */
export function Finish({ finish }: { finish: string | null }) {
  if (!finish) return <span className="muted">-</span>;
  if (/^\d+$/.test(finish)) return <span className={`fin fin-${finish}`}>{finish}着</span>;
  return <span className="muted">{finish}</span>;
}

/** 順位バッジ */
export function Rank({ rank }: { rank: number }) {
  return <span className={`rk rk-${rank}`}>{rank}</span>;
}

const MARK_TEXT: Record<MarkKind, { label: string; title: string; legend: string }> = {
  local: { label: "地", title: "地方競馬の所属", legend: "地方競馬に所属" },
  mine: { label: "指", title: "あなたの指名馬", legend: "あなたの指名馬" },
  taken: { label: "済", title: "この大会でほかの人が指名済み", legend: "この大会で指名済み" },
  popular: { label: "人気", title: `全大会の指名数${POPULAR_TOP}位以内`, legend: `全大会の指名数${POPULAR_TOP}位以内（${POPULAR_MIN_PICKS}大会以上）` },
};

/** 一つのアイコン */
export function Mark({ kind }: { kind: MarkKind }) {
  const m = MARK_TEXT[kind];
  return <span className={`mk mk-${kind}`} title={m.title} aria-label={m.title}>{m.label}</span>;
}

/** 馬名の横に並べるアイコン（地方・指名・済・人気） */
export function MarkBadges({ id, trainer, marks }: { id: string; trainer?: string | null; marks?: HorseMarks }) {
  const kinds = marksFor(id, trainer, marks);
  if (kinds.length === 0) return null;
  return <>{kinds.map((k) => <Mark key={k} kind={k} />)}</>;
}

/** アイコンの見方（一覧の上に置く） */
export function MarkLegend({ kinds = ["local", "mine", "popular"], sex = true }: { kinds?: MarkKind[]; sex?: boolean }) {
  return (
    <div className="mk-legend" aria-label="アイコンの見方">
      {sex && <>
        <span className="mk-item"><span className="sex sex-牡">牡</span>牡馬</span>
        <span className="mk-item"><span className="sex sex-牝">牝</span>牝馬</span>
      </>}
      {kinds.map((k) => <span className="mk-item" key={k}><Mark kind={k} />{MARK_TEXT[k].legend}</span>)}
    </div>
  );
}
