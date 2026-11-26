// ポイント集計（データベースに依存しない純粋な計算）
import { rulesOf, scoreRace } from "./group-rules";

export type Rules = {
  season_start: string; // YYYY-MM-DD
  season_end: string;
  include_non_jra: boolean;
  /** 大会ごとのルール（groups.rules）。空なら今までどおり本賞金の合計 */
  rules?: unknown;
  picks_per_member?: number;
};

export type ResultRow = {
  horse_id: string;
  race_date: string;
  prize_man: number;
  is_jra: boolean;
  finish: string | null;
  race_name?: string | null;
  surface?: string | null;
};

export type PickRow = { user_id: string; horse_id: string };

export type HorseScore = {
  horse_id: string;
  points: number;
  weekPoints: number;
  starts: number;
  wins: number;
  /** 重賞ボーナスの合計（points に含まれる） */
  bonus: number;
};

export type MemberScore = {
  user_id: string;
  points: number;
  weekPoints: number;
  wins: number;
  horses: HorseScore[];
  rank: number;
};

export function countsForRules(r: ResultRow, rules: Rules): boolean {
  if (r.race_date < rules.season_start || r.race_date > rules.season_end) return false;
  if (rules.rules) return scoreRace(r, rulesOf(rules)).counted;
  return r.is_jra || rules.include_non_jra;
}

/** today から7日以内（今日を含む）の成績を「今週」とみなす */
export function isThisWeek(raceDate: string, today: string): boolean {
  const d = Date.parse(raceDate);
  const t = Date.parse(today);
  return d <= t && t - d < 7 * 24 * 3600 * 1000;
}

export function scoreHorse(horseId: string, results: ResultRow[], rules: Rules, today: string): HorseScore {
  const gr = rulesOf(rules);
  const s: HorseScore = { horse_id: horseId, points: 0, weekPoints: 0, starts: 0, wins: 0, bonus: 0 };
  for (const r of results) {
    if (r.horse_id !== horseId || r.race_date < rules.season_start || r.race_date > rules.season_end) continue;
    const sc = scoreRace(r, gr);
    if (!sc.counted) continue;
    s.starts += 1;
    if (r.finish === "1") s.wins += 1;
    s.points += sc.points;
    s.bonus += sc.bonus;
    if (isThisWeek(r.race_date, today)) s.weekPoints += sc.points;
  }
  s.points = round1(s.points);
  s.weekPoints = round1(s.weekPoints);
  s.bonus = round1(s.bonus);
  return s;
}

export function computeStandings(
  memberIds: string[],
  picks: PickRow[],
  results: ResultRow[],
  rules: Rules,
  today: string,
): MemberScore[] {
  const bestN = rulesOf(rules).bestN;
  const scores: MemberScore[] = memberIds.map((user_id) => {
    const horses = picks
      .filter((p) => p.user_id === user_id)
      .map((p) => scoreHorse(p.horse_id, results, rules, today))
      .sort((a, b) => b.points - a.points);
    const counted = bestN ? horses.slice(0, bestN) : horses;
    return {
      user_id,
      horses,
      points: round1(counted.reduce((a, h) => a + h.points, 0)),
      weekPoints: round1(counted.reduce((a, h) => a + h.weekPoints, 0)),
      wins: horses.reduce((a, h) => a + h.wins, 0),
      rank: 0,
    };
  });
  scores.sort((a, b) => b.points - a.points || b.wins - a.wins);
  // 同点は同順位
  scores.forEach((s, i) => {
    s.rank = i > 0 && s.points === scores[i - 1].points && s.wins === scores[i - 1].wins ? scores[i - 1].rank : i + 1;
  });
  return scores;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** シーズンの初期値。6月以降なら「今年6月〜来年のダービー」、それ以前なら「去年6月〜今年のダービー」 */
export function defaultSeason(now = new Date()) {
  const y = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    crop_year: y - 2,
    season_start: `${y}-06-01`,
    season_end: lastSundayOfMay(y + 1),
  };
}

export function lastSundayOfMay(year: number): string {
  const d = new Date(Date.UTC(year, 4, 31));
  d.setUTCDate(31 - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}
