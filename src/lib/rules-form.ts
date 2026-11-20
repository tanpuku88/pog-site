import { defaultSeason } from "@/lib/standings";

/** グループ作成・設定フォームの値を読み取る */
export function parseRulesForm(form: FormData) {
  const d = defaultSeason();
  const int = (k: string, def: number, min: number, max: number) => {
    const n = Math.trunc(Number(form.get(k)));
    return Number.isFinite(n) && n >= min && n <= max ? n : def;
  };
  const date = (k: string, def: string) => {
    const v = String(form.get(k) ?? "");
    return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : def;
  };
  return {
    picks_per_member: int("picks_per_member", 10, 1, 50),
    crop_year: int("crop_year", d.crop_year, 2000, 2100),
    season_start: date("season_start", d.season_start),
    season_end: date("season_end", d.season_end),
    include_non_jra: form.get("include_non_jra") === "on",
  };
}
