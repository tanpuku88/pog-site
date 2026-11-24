// 種牡馬・厩舎・馬主・生産牧場ごとの POG 向けデータ（今の2歳世代＋1つ前の世代）。
import type { SupabaseClient } from "@supabase/supabase-js";
import { aggregateSires, loadCropData, sireTable, type GroupField, type SireRow } from "./sires";
import { defaultSeason } from "./standings";
import { todayJst } from "./util";
import { filterArea, type Area } from "./area";

/** 世代のデータを中央所属・地方所属の片方だけに絞る（指名・成績も絞った馬の分だけに） */
export function cropOfArea<T extends { horses: { id: string; trainer: string | null }[]; races: { horse_id: string }[] }>(d: T, area: Area): T {
  const horses = filterArea(d.horses, area);
  const ids = new Set(horses.map((h) => h.id));
  return { ...d, horses, races: d.races.filter((r) => ids.has(r.horse_id)) };
}

export type Kind = {
  field: GroupField;
  path: string;
  /** 「厩舎」など */
  label: string;
  /** 「管理馬」など、所属する馬の呼び方 */
  member: string;
  /** ページの説明に使う短い一文 */
  lead: string;
};

export const KINDS: Record<GroupField, Kind> = {
  sire: { field: "sire", path: "/sires", label: "種牡馬", member: "産駒", lead: "父ごとの産駒の成績" },
  trainer: { field: "trainer", path: "/trainers", label: "厩舎", member: "管理馬", lead: "調教師ごとの2歳馬の成績" },
  owner: { field: "owner", path: "/owners", label: "馬主", member: "所有馬", lead: "馬主ごとの2歳馬の成績" },
  breeder: { field: "breeder", path: "/breeders", label: "生産牧場", member: "生産馬", lead: "生産者ごとの2歳馬の成績" },
};
export const KIND_LIST = [KINDS.sire, KINDS.trainer, KINDS.owner, KINDS.breeder];

export const groupHref = (kind: Kind, name: string) => `${kind.path}/${encodeURIComponent(name)}`;

/** 1つ前の世代のシーズン（例: 今が2024年生まれなら2023年生まれ・2025年6月〜2026年ダービー） */
export function previousSeason(now = new Date()) {
  const cur = defaultSeason(now);
  const prev = defaultSeason(new Date(Date.UTC(Number(cur.season_start.slice(0, 4)) - 1, 6, 1)));
  return prev;
}

const rulesOf = (s: ReturnType<typeof defaultSeason>) => ({ ...s, include_non_jra: true });

/** 一覧ページ用：今の世代の表と、前の世代のまとめ（名前 → 成績） */
export async function loadGroupRanking(db: SupabaseClient, kind: Kind, area: Area = "jra") {
  const season = defaultSeason();
  const prev = previousSeason();
  const [cur, old] = (await Promise.all([
    loadCropData(db, season.crop_year, rulesOf(season)),
    loadCropData(db, prev.crop_year, rulesOf(prev)),
  ])).map((d) => cropOfArea(d, area));
  const rows = sireTable(cur.horses, cur.picks, cur.tally, cur.races, todayJst(), kind.field);
  const prevRows = new Map(aggregateSires(old.horses, old.picks, old.tally, kind.field).map((r) => [r.sire, r]));
  return { season, prev, rows, prevRows, horseCount: cur.horses.length, prevHorseCount: old.horses.length };
}

/** 個別ページ用：その名前の馬だけを、今の世代と前の世代で読む */
export async function loadGroupDetail(db: SupabaseClient, kind: Kind, name: string, area?: Area) {
  const season = defaultSeason();
  const prev = previousSeason();
  const only = { field: kind.field, value: name };
  const [all, allOld] = await Promise.all([
    loadCropData(db, season.crop_year, rulesOf(season), only),
    loadCropData(db, prev.crop_year, rulesOf(prev), only),
  ]);
  // 中央・地方の両方に馬がいるか（種牡馬・馬主・牧場）。指定がなければ馬の多いほうを出す
  const counts = { jra: filterArea(all.horses, "jra").length, nar: filterArea(all.horses, "nar").length };
  const chosen: Area = area ?? (counts.nar > counts.jra ? "nar" : "jra");
  const cur = cropOfArea(all, chosen), old = cropOfArea(allOld, chosen);
  const summary: SireRow | undefined = aggregateSires(cur.horses, cur.picks, cur.tally, kind.field)[0];
  const prevSummary: SireRow | undefined = aggregateSires(old.horses, old.picks, old.tally, kind.field)[0];
  const rows = cur.horses
    .map((h) => ({ h, picks: cur.picks.get(h.id) ?? 0, t: cur.tally.get(h.id) ?? { points: 0, starts: 0, wins: 0 } }))
    .sort((a, b) => b.t.points - a.t.points || b.t.wins - a.t.wins || b.picks - a.picks || a.h.name.localeCompare(b.h.name, "ja"));
  const prevTop = old.horses
    .map((h) => ({ h, t: old.tally.get(h.id) ?? { points: 0, starts: 0, wins: 0 } }))
    .filter((x) => x.t.points > 0)
    .sort((a, b) => b.t.points - a.t.points)
    .slice(0, 5);
  return { season, prev, summary, prevSummary, rows, prevTop, horses: cur.horses, races: cur.races, area: chosen, counts };
}

/** 所属馬の中で多い順に「父」「厩舎」などを数える（個別ページの「主な○○」用） */
export function topValues<T>(items: T[], pick: (x: T) => string | null | undefined, n = 5): { name: string; count: number }[] {
  const m = new Map<string, number>();
  for (const x of items) {
    const v = pick(x);
    if (v) m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ja")).slice(0, n);
}

/** 勝ち上がり率（%）。出走0頭なら null */
export const winnerRate = (r: { winners: number; starters: number }) =>
  r.starters > 0 ? Math.round((r.winners / r.starters) * 1000) / 10 : null;

/** 見出し：「キタサンブラック産駒」「木村哲也厩舎（美浦）」「ノーザンファームの生産馬」 */
export function titleOf(kind: Kind, name: string) {
  if (kind.field === "sire") return `${name}産駒`;
  if (kind.field === "trainer") {
    const m = name.match(/^(.+?)\s*[(（](.+)[)）]$/);
    return m ? `${m[1]}厩舎（${m[2]}）` : `${name}厩舎`;
  }
  return `${name}の${kind.member}`;
}

/** 表示用に「(有)」「(株)」などを外した短い名前（リンク先は元の名前のまま） */
export const shortName = (name: string) => name.replace(/[(（](有|株|合|同|一社|社)[)）]/g, "").trim() || name;
