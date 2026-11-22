// 名鑑の仕上げ：種牡馬の適性（過去の全産駒・現役時代から）、全員ちがう二つ名、列伝の自動文。
import { LORE } from "./lore";
import { commentKey } from "./comments";
import { distanceLabel, nickname, type Profile } from "./profile";
import type { SireData } from "./sire-data";
import type { GroupField } from "./sires";

const rate = (w: number, r: number) => (r > 0 ? w / r : 0);

/** 値の並びの中の位置を 1〜100 に */
function pctRank(values: number[], v: number) {
  const s = [...values].sort((a, b) => a - b);
  if (s.length < 2) return 50;
  const below = s.filter((x) => x < v).length, same = s.filter((x) => x === v).length;
  return Math.max(1, Math.min(100, Math.round(((below + (same - 1) / 2) / (s.length - 1)) * 99) + 1));
}

export type SireApt = { turf: number | null; dirt: number | null; distance: number | null; source: "offspring" | "career" | null };

/** 種牡馬の芝・ダート適性と得意距離。産駒が十分走っていれば産駒の累計、いなければ現役時代の成績から */
export function sireAptitudes(all: Record<string, SireData>): Map<string, SireApt> {
  const ok = (d: SireData, k: "turf" | "dirt") => (d.offspring?.[`${k}Runs`] ?? 0) >= 30;
  const turfVals = Object.values(all).filter((d) => ok(d, "turf")).map((d) => rate(d.offspring!.turfWins, d.offspring!.turfRuns));
  const dirtVals = Object.values(all).filter((d) => ok(d, "dirt")).map((d) => rate(d.offspring!.dirtWins, d.offspring!.dirtRuns));
  const out = new Map<string, SireApt>();
  for (const [name, d] of Object.entries(all)) {
    const o = d.offspring;
    if (o && (ok(d, "turf") || ok(d, "dirt"))) {
      // 芝・ダートそれぞれの勝率の順位。出走の偏り（ほとんど芝しか走らない等）も少し加味する
      const share = o.turfRuns / Math.max(1, o.turfRuns + o.dirtRuns);
      const t = ok(d, "turf") ? pctRank(turfVals, rate(o.turfWins, o.turfRuns)) : null;
      const r = ok(d, "dirt") ? pctRank(dirtVals, rate(o.dirtWins, o.dirtRuns)) : null;
      const adj = (v: number | null, sh: number) => (v === null ? (sh < 0.15 ? 15 : null) : Math.round(Math.min(100, Math.max(1, v * 0.75 + sh * 25))));
      const dist = o.turfWins + o.dirtWins > 0
        ? Math.round(((o.avgDistTurf ?? 0) * o.turfWins + (o.avgDistDirt ?? 0) * o.dirtWins) / (o.turfWins + o.dirtWins))
        : null;
      out.set(name, { turf: adj(t, share), dirt: adj(r, 1 - share), distance: dist || null, source: "offspring" });
    } else if (d.career && d.career.runs > 0 && !d.id.startsWith("000a")) {
      const c = d.career;
      const share = c.turfRuns / Math.max(1, c.turfRuns + c.dirtRuns);
      const g1 = c.bigWins.filter((w) => w.grade === 1);
      const base = g1.length ? 80 : c.bigWins.length ? 65 : 50;
      const turf = Math.round(share >= 0.7 ? base : share >= 0.3 ? base - 10 : 20);
      const dirt = Math.round(share <= 0.3 ? base : share <= 0.7 ? base - 10 : 20);
      out.set(name, { turf, dirt, distance: c.avgWinDist, source: "career" });
    }
  }
  return out;
}

/** 二つ名の材料：その種牡馬のいちばんの勝ち鞍、代表産駒 */
function sireNick(name: string, d: SireData | undefined, apt: SireApt | undefined): string | null {
  const lore = LORE.sire[name];
  if (lore) return lore.nick;
  if (!d) return null;
  const ground = apt && apt.dirt !== null && apt.turf !== null ? (apt.dirt > apt.turf + 15 ? "砂の" : apt.turf > apt.dirt + 15 ? "芝の" : "") : "";
  const dist = distanceLabel(apt?.distance ?? null);
  const noun = dist === "短距離" ? "快速王" : dist === "長距離" ? "名ステイヤー" : dist === "マイル" ? "マイラー" : dist === "中距離" ? "中距離王" : null;
  const epithet = noun ? `${ground}${noun}` : ground ? `${ground}名手` : "名血";
  const top = d.career?.bigWins[0];
  if (top && top.grade === 1) return `${top.year}年${top.race.replace(/競走$/, "")}の覇者`;
  const best = d.offspring?.best;
  if (best && (d.offspring?.gradedWins ?? 0) > 0) return `${best}を出した${epithet}`;
  if (top) return `${top.year}年${top.race}を制した${epithet}`;
  if (best) return noun || ground ? `${best}の父・${epithet}` : `${best}の父`;
  if (d.career && d.career.runs > 0) return d.career.wins > 0 ? `${d.career.runs}戦${d.career.wins}勝の叩き上げ${epithet}` : `${d.career.runs}戦で去った幻の素質馬`;
  return null;
}

const KIND_WORD: Record<Exclude<GroupField, "sire">, string[]> = {
  trainer: ["仕事人", "名伯楽", "勝負師", "職人", "仕掛け人"],
  owner: ["オーナー", "勝負服", "馬主"],
  breeder: ["牧場", "生産者", "育ての親"],
};

/** その一覧の全員に、重ならない二つ名を付ける */
export function uniqueNicknames(field: GroupField, profiles: Map<string, Profile>, sires?: Record<string, SireData>, apts?: Map<string, SireApt>): Map<string, string> {
  const out = new Map<string, string>();
  const used = new Map<string, number>();
  const names = [...profiles.keys()].sort((a, b) => (profiles.get(b)!.m.points - profiles.get(a)!.m.points) || a.localeCompare(b, "ja"));
  for (const name of names) {
    const p = profiles.get(name)!;
    let nick: string | null = null;
    if (field === "sire") nick = sireNick(name, sires?.[name], apts?.get(name));
    else {
      const lore = LORE[field][commentKey(name)];
      if (lore) nick = lore.nick;
      else {
        const sc = p.scores;
        const adj = (sc.power ?? 0) >= 85 ? "一発大物の" : (sc.consistency ?? 0) >= 80 ? "堅実な" : (sc.early ?? 0) >= 85 ? "早仕掛けの"
          : (sc.dirt ?? 0) >= 75 && (sc.dirt ?? 0) > (sc.turf ?? 0) + 15 ? "砂の" : (sc.turf ?? 0) >= 75 && (sc.turf ?? 0) > (sc.dirt ?? 0) + 15 ? "芝の" : "期待の";
        const words = KIND_WORD[field];
        const w = words[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % words.length];
        nick = p.m.top ? `${p.m.top.name}を擁する${adj}${w}` : nickname(field, p);
      }
    }
    nick ??= nickname(field, p);
    const n = used.get(nick) ?? 0;
    used.set(nick, n + 1);
    out.set(name, n === 0 ? nick : `${nick}・${["", "弐", "参", "肆", "伍", "陸", "漆", "捌", "玖"][n] ?? n + 1}`);
  }
  return out;
}

const pct1 = (v: number) => `${(v * 100).toFixed(1)}%`;

/** 種牡馬の列伝（データ部分）：産駒の特徴と現役時代 */
export function sireStory(d: SireData | null, apt: SireApt | undefined): { traits: string[]; career: string | null } {
  const traits: string[] = [];
  const o = d?.offspring;
  if (o && o.runs > 0) {
    const tShare = o.turfWins / Math.max(1, o.turfWins + o.dirtWins);
    const type = tShare >= 0.75 ? "はっきりとした芝型" : tShare >= 0.55 ? "芝寄りの万能型" : tShare >= 0.45 ? "芝・ダート兼用の二刀流" : tShare >= 0.25 ? "ダート寄りの万能型" : "はっきりとしたダート型";
    traits.push(`これまでの産駒は中央でのべ${o.runs.toLocaleString()}戦${o.wins.toLocaleString()}勝。勝ち星の${Math.round(tShare * 100)}%を芝で挙げている${type}です。`);
    const parts: string[] = [];
    if (o.turfRuns > 0) parts.push(`芝の勝率${pct1(rate(o.turfWins, o.turfRuns))}`);
    if (o.dirtRuns > 0) parts.push(`ダートの勝率${pct1(rate(o.dirtWins, o.dirtRuns))}`);
    if (parts.length) traits.push(`${parts.join("、")}。`);
    const dl = [o.avgDistTurf && `芝${o.avgDistTurf.toLocaleString()}m`, o.avgDistDirt && `ダート${o.avgDistDirt.toLocaleString()}m`].filter(Boolean).join("・");
    if (dl) traits.push(`勝ったレースの平均距離は${dl}で、${distanceLabel(apt?.distance ?? null) ?? "中距離"}が得意ゾーン。`);
    if (o.winnerRate !== null) traits.push(`デビューした産駒のうち勝ち上がったのは${o.winnerRate.toFixed(1)}%${o.winnerRate >= 40 ? "と高く、POGで外しにくい父" : o.winnerRate >= 30 ? "で、平均以上の安定感" : "と、当たり外れの差が大きいタイプ"}。`);
    if (o.gradedWins > 0 && o.best) traits.push(`重賞は通算${o.gradedWins}勝、代表産駒は${o.best}。`);
    else if (o.best) traits.push(`代表産駒は${o.best}。`);
  } else if (d?.career) {
    traits.push("産駒はまだ中央で本格的に走っていない新しい種牡馬。適性は現役時代の走りから見ています。");
  }
  let career: string | null = null;
  const c = d?.career;
  const foreign = d?.id.startsWith("000a") ?? false;
  if (c && c.runs > 0 && foreign) {
    // 海外の馬は netkeiba に載っている成績が一部だけなので、戦績の数字は出さない
    const g = c.bigWins.slice(0, 4).map((w) => `${w.year}年${w.race.replace(/競走$/, "")}`);
    career = `海外で走った輸入種牡馬。${g.length ? `主な勝ち鞍は${g.join("、")}。` : ""}`;
  } else if (c && c.runs > 0) {
    const g = c.bigWins.slice(0, 4).map((w) => `${w.year}年${w.race.replace(/競走$/, "")}`);
    const ground = c.turfRuns >= c.dirtRuns * 2 ? "芝" : c.dirtRuns >= c.turfRuns * 2 ? "ダート" : "芝・ダート";
    career = `現役時代は${c.runs}戦${c.wins}勝（3着以内${c.places}回）。主に${ground}を走り、${c.avgWinDist ? `勝ったレースの平均距離は${c.avgWinDist.toLocaleString()}m。` : ""}${g.length ? `主な勝ち鞍は${g.join("、")}。` : ""}`;
  }
  return { traits, career };
}
