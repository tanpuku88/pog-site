import Link from "next/link";
import { horsePageUrl } from "@/lib/netkeiba/fetch";

type H = { id: string; name: string; sex?: string | null; sire?: string | null; dam?: string | null; damsire?: string | null; trainer?: string | null };

/** 馬名＋性別バッジ＋血統の1セル */
export function HorseLabel({ horse, id, groupId, showPed = true, showTrainer = false }: { horse?: H; id: string; groupId?: string; showPed?: boolean; showTrainer?: boolean }) {
  return (
    <>
      {groupId
        ? <Link className="horse-name" href={`/g/${groupId}/h/${id}`}>{horse?.name ?? id}</Link>
        : <a className="horse-name" href={horsePageUrl(id)} target="_blank" rel="noreferrer">{horse?.name ?? id}</a>}
      {horse?.sex && <span className={`sex sex-${horse.sex}`}>{horse.sex}</span>}
      {showPed && (horse?.sire || horse?.dam) && (
        <div className="ped">
          {horse?.sire && <>父 <Link href={`/sires/${encodeURIComponent(horse.sire)}`} className="sire-link"><b>{horse.sire}</b></Link></>}
          {horse?.dam && <>　母 <b>{horse.dam}</b></>}
          {horse?.damsire && <>（母父 {horse.damsire}）</>}
          {showTrainer && horse?.trainer && <>　{horse.trainer}</>}
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
