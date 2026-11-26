import { defaultSeason } from "./standings";
import { normalizeRules, type GroupRules } from "./group-rules";

/** グループ作成・設定フォームの値を読み取る（groups に保存する列＋rules） */
export function parseRulesForm(form: FormData) {
  const d = defaultSeason();
  const int = (k: string, def: number, min: number, max: number) => {
    const n = Math.trunc(Number(form.get(k)));
    return form.get(k) !== null && form.get(k) !== "" && Number.isFinite(n) && n >= min && n <= max ? n : def;
  };
  const date = (k: string, def: string) => {
    const v = String(form.get(k) ?? "");
    return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : def;
  };
  const picks = int("picks_per_member", 10, 1, 50);
  const split = form.get("sex_split") === "on";
  const male = split ? int("male", Math.ceil(picks / 2), 0, picks) : null;
  const raw: GroupRules = {
    version: 1,
    preset: (["standard", "simple", "points"] as const).find((p) => p === form.get("preset")) ?? "custom",
    male,
    female: male === null ? null : picks - male,
    base: form.get("base") === "finish" ? "finish" : "prize",
    finishPoints: [1, 2, 3, 4, 5].map((i) => int(`fp${i}`, 0, 0, 1000)),
    gradeBonus: { G1: int("g1", 0, 0, 100000), G2: int("g2", 0, 0, 100000), G3: int("g3", 0, 0, 100000) },
    nonJraRate: int("non_jra_rate", 0, 0, 100),
    excludeJump: form.get("exclude_jump") === "on",
    bestN: form.get("best_n") ? int("best_n", 0, 1, picks) || null : null,
  };
  const rules = normalizeRules(raw, raw.nonJraRate > 0, picks);
  return {
    picks_per_member: picks,
    crop_year: int("crop_year", d.crop_year, 2000, 2100),
    season_start: date("season_start", d.season_start),
    season_end: date("season_end", d.season_end),
    include_non_jra: rules.nonJraRate > 0,
    rules,
  };
}
