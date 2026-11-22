// netkeiba の HTML を解析する。
// ページの見た目が変わっても壊れにくいよう、列の位置ではなく見出しの文字で列を探す。
import * as cheerio from "cheerio";

export const JRA_VENUES = ["札幌", "函館", "福島", "新潟", "東京", "中山", "中京", "京都", "阪神", "小倉"];
export const JRA_VENUE_CODES: Record<string, string> = {
  "01": "札幌", "02": "函館", "03": "福島", "04": "新潟", "05": "東京",
  "06": "中山", "07": "中京", "08": "京都", "09": "阪神", "10": "小倉",
};

/** 地方競馬の場コード（ばんえい＝帯広は対象外） */
export const NAR_VENUE_CODES: Record<string, string> = {
  "30": "門別", "35": "盛岡", "36": "水沢", "42": "浦和", "43": "船橋", "44": "大井", "45": "川崎",
  "46": "金沢", "47": "笠松", "48": "名古屋", "50": "園田", "51": "姫路", "54": "高知", "55": "佐賀",
};

/** race_id（12桁）の場コードから競馬場名を返す。中央・地方どちらも */
export const venueOfRaceId = (raceId: string): string | null =>
  JRA_VENUE_CODES[raceId.slice(4, 6)] ?? NAR_VENUE_CODES[raceId.slice(4, 6)] ?? null;

export type HorseProfile = {
  id: string;
  name: string;
  sex: string | null;
  birth_year: number | null;
  sire: string | null;
  dam: string | null;
  damsire: string | null;
  trainer: string | null;
  owner: string | null;
  breeder: string | null;
  /** セリの落札価格（万円）・セリの名前・年。セリを通っていなければ null */
  sale_price_man: number | null;
  sale_name: string | null;
  sale_year: number | null;
  /** 一口クラブの募集総額（万円）＝ 1口の価格 × 口数 */
  club_price_man: number | null;
};

export type RaceResult = {
  race_date: string; // YYYY-MM-DD
  venue: string;
  race_name: string;
  race_id: string | null;
  finish: string | null;
  prize_man: number;
  is_jra: boolean;
  /** 「芝」「ダ」「障」。読めなければ null */
  surface: string | null;
  /** 距離（m） */
  distance: number | null;
};

const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();
const orNull = (s: string) => (s === "" ? null : s);

function horseIdFromHref(href: string | undefined): string | null {
  const m = href?.match(/\/horse\/(\w{10})\/?/);
  return m ? m[1] : null;
}

/** 見出し行から「見出し文字 → 列番号」の表を作る */
function headerIndex($: cheerio.CheerioAPI, table: ReturnType<cheerio.CheerioAPI>): Map<string, number> {
  const map = new Map<string, number>();
  const headRow = table.find("tr").filter((_, tr) => $(tr).find("th").length > 0).first();
  headRow.find("th").each((i, th) => {
    map.set(clean($(th).text()).replace(/\s/g, ""), i);
  });
  return map;
}

function findCol(idx: Map<string, number>, ...names: string[]): number {
  for (const n of names) {
    for (const [k, v] of idx) if (k === n) return v;
  }
  for (const n of names) {
    for (const [k, v] of idx) if (k.startsWith(n)) return v;
  }
  return -1;
}

/** 「4東京3」→「東京」、「大井」→「大井」 */
export function venueName(kaisai: string): string {
  return clean(kaisai).replace(/\d+/g, "").trim();
}

export function isJraVenue(venue: string): boolean {
  return JRA_VENUES.includes(venue);
}

/** 「1,450.0」→ 1450。空欄や「-」は 0 */
export function parsePrize(s: string): number {
  const n = Number(clean(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** 「2026/10/12」→「2026-10-12」 */
export function parseDate(s: string): string | null {
  const m = clean(s).match(/(\d{4})[\/年.-](\d{1,2})[\/月.-](\d{1,2})/);
  if (!m) return null;
  return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
}

/** 馬ページ（または成績ページ）から成績表を読む。表が見つからなければ null */
export function parseRaceResults(html: string): RaceResult[] | null {
  const $ = cheerio.load(html);
  const table = $("table")
    .filter((_, t) => {
      const idx = headerIndex($, $(t));
      return findCol(idx, "日付") >= 0 && findCol(idx, "賞金") >= 0;
    })
    .first();
  if (table.length === 0) return null;

  const idx = headerIndex($, table);
  const cDate = findCol(idx, "日付");
  const cVenue = findCol(idx, "開催");
  const cName = findCol(idx, "レース名");
  const cFinish = findCol(idx, "着順");
  const cPrize = findCol(idx, "賞金");
  const cDist = findCol(idx, "距離");

  const results: RaceResult[] = [];
  table.find("tr").each((_, tr) => {
    const tds = $(tr).find("td");
    if (tds.length === 0) return;
    const date = parseDate(tds.eq(cDate).text());
    if (!date) return;
    const venue = cVenue >= 0 ? venueName(tds.eq(cVenue).text()) : "";
    const nameCell = cName >= 0 ? tds.eq(cName) : tds.eq(0);
    const raceHref = nameCell.find("a").attr("href") ?? "";
    results.push({
      race_date: date,
      venue,
      race_name: clean(nameCell.text()) || "(不明)",
      race_id: raceHref.match(/race\/(\w+)\/?/)?.[1] ?? null,
      finish: cFinish >= 0 ? orNull(clean(tds.eq(cFinish).text())) : null,
      prize_man: cPrize >= 0 ? parsePrize(tds.eq(cPrize).text()) : 0,
      is_jra: isJraVenue(venue),
      ...parseCourse(cDist >= 0 ? tds.eq(cDist).text() : ""),
    });
  });
  return results;
}

/** 馬ページからプロフィールを読む */
export function parseHorseProfile(id: string, html: string): HorseProfile | null {
  const $ = cheerio.load(html);
  const name = clean($(".horse_title h1").first().text());
  if (!name) return null;

  const sub = clean($(".horse_title p.txt_01").first().text());
  const sex = sub.match(/(牡|牝|セ)/)?.[1] ?? null;

  const prof = new Map<string, string>();
  $("table.db_prof_table tr").each((_, tr) => {
    prof.set(clean($(tr).find("th").text()), clean($(tr).find("td").text()));
  });
  const birth = prof.get("生年月日") ?? "";
  const birthYear = birth.match(/(\d{4})年/)?.[1];

  const blood = parseBloodTable($);

  return {
    id,
    name,
    sex,
    birth_year: birthYear ? Number(birthYear) : null,
    ...blood,
    trainer: orNull(prof.get("調教師") ?? ""),
    owner: orNull(prof.get("馬主") ?? ""),
    breeder: orNull(prof.get("生産者") ?? ""),
    ...parseSale(prof.get("セリ取引価格") ?? ""),
    club_price_man: parseClubPrice(prof.get("募集情報") ?? ""),
  };
}

export type SearchHit = {
  id: string;
  name: string;
  sex: string | null;
  birth_year: number | null;
  sire: string | null;
  dam: string | null;
  damsire: string | null;
  trainer: string | null;
};

/** 馬名検索の結果一覧を読む */
export function parseHorseSearch(html: string): SearchHit[] {
  const $ = cheerio.load(html);
  const table = $("table")
    .filter((_, t) => {
      const idx = headerIndex($, $(t));
      return findCol(idx, "馬名") >= 0 && findCol(idx, "父") >= 0;
    })
    .first();
  if (table.length === 0) return [];
  const idx = headerIndex($, table);
  const col = {
    name: findCol(idx, "馬名"),
    sex: findCol(idx, "性"),
    year: findCol(idx, "生年"),
    trainer: findCol(idx, "厩舎", "調教師"),
    sire: findCol(idx, "父"),
    dam: findCol(idx, "母"),
    damsire: findCol(idx, "母父"),
  };
  const hits: SearchHit[] = [];
  table.find("tr").each((_, tr) => {
    const tds = $(tr).find("td");
    if (tds.length === 0) return;
    const nameCell = tds.eq(col.name);
    const id = horseIdFromHref(nameCell.find("a").attr("href"));
    if (!id) return;
    const t = (c: number) => (c >= 0 ? orNull(clean(tds.eq(c).text())) : null);
    const year = t(col.year)?.match(/\d{4}/)?.[0];
    hits.push({
      id,
      name: clean(nameCell.text()),
      sex: t(col.sex),
      birth_year: year ? Number(year) : null,
      sire: t(col.sire),
      dam: t(col.dam),
      damsire: t(col.damsire),
      trainer: t(col.trainer),
    });
  });
  return hits;
}

/** 開催日のレース一覧から race_id を集める（JRAのみ） */
export function parseRaceList(html: string): string[] {
  return raceIdsIn(html, JRA_VENUE_CODES);
}

/** 地方競馬の開催日のレース一覧から race_id を集める（ばんえいは除く） */
export function parseNarRaceList(html: string): string[] {
  return raceIdsIn(html, NAR_VENUE_CODES);
}

function raceIdsIn(html: string, codes: Record<string, string>): string[] {
  const ids = new Set<string>();
  for (const m of html.matchAll(/race_id=(\d{12})/g)) {
    if (codes[m[1].slice(4, 6)]) ids.add(m[1]);
  }
  return [...ids].sort();
}

export type Shutuba = {
  race_id: string;
  race_name: string | null;
  venue: string | null;
  race_no: number;
  post_time: string | null;
  horse_ids: string[];
};

/** 出馬表から出走馬の馬IDを集める */
export function parseShutuba(raceId: string, html: string): Shutuba {
  const $ = cheerio.load(html);
  const horseIds = new Set<string>();
  $("a[href*='/horse/']").each((_, a) => {
    const id = horseIdFromHref($(a).attr("href"));
    if (id) horseIds.add(id);
  });
  const data01 = clean($(".RaceData01").first().text());
  return {
    race_id: raceId,
    race_name: orNull(clean($(".RaceName").first().text())),
    venue: venueOfRaceId(raceId),
    race_no: Number(raceId.slice(10, 12)),
    post_time: data01.match(/(\d{1,2}:\d{2})/)?.[1] ?? null,
    horse_ids: [...horseIds],
  };
}

export type Pedigree = { sire: string | null; dam: string | null; damsire: string | null };

/**
 * 血統表（table.blood_table）から父・母・母父を読む。
 * 馬ページの簡易版（2代）と血統ページ（5代）のどちらでも読めるように、
 * 「1列目のセル（rowspan が一番大きいセル）」を父・母として扱う。
 */
export function parseBloodTable($: cheerio.CheerioAPI): Pedigree {
  const rows = $("table.blood_table").first().find("tr").toArray();
  const span = (el: unknown) => Number($(el as never).attr("rowspan") ?? 1) || 1;
  const firstTds = rows.map((tr) => $(tr).find("td").first());
  const max = Math.max(0, ...firstTds.map((td) => (td.length ? span(td.get(0)) : 0)));
  const top = rows.filter((_, i) => firstTds[i].length && span(firstTds[i].get(0)) === max);
  const name = (tr: unknown, c: number) => {
    const td = $(tr as never).find("td").eq(c);
    return orNull(clean(td.find("a").first().text() || td.text()));
  };
  if (max === 0 || top.length < 2) return { sire: null, dam: null, damsire: null };
  return { sire: name(top[0], 0), dam: name(top[1], 0), damsire: name(top[1], 1) };
}

/** 血統ページ（/horse/ped/{id}/）から父・母・母父を読む */
export function parsePedigreePage(html: string): Pedigree {
  return parseBloodTable(cheerio.load(html));
}

/** 「1億5,400万円」「330万円」「5,000円」→ 万円。読めなければ null */
export function parseYenMan(s: string): number | null {
  const t = clean(s).replace(/,/g, "");
  const m = t.match(/(?:(\d+(?:\.\d+)?)億)?(?:(\d+(?:\.\d+)?)万)?(?:(\d+)円)?/);
  if (!m || (!m[1] && !m[2] && !m[3])) return null;
  const v = Number(m[1] ?? 0) * 10000 + Number(m[2] ?? 0) + Number(m[3] ?? 0) / 10000;
  return Math.round(v * 100) / 100;
}

/** 「330万円 (2025年 北海道サマーセール)」→ 価格・セリ名・年。「-」なら全部 null */
export function parseSale(s: string): { sale_price_man: number | null; sale_name: string | null; sale_year: number | null } {
  const t = clean(s);
  const price = /\d/.test(t) ? parseYenMan(t.split(/[(（]/)[0]) : null;
  if (!price) return { sale_price_man: null, sale_name: null, sale_year: null };
  const inner = t.match(/[(（]\s*(?:(\d{4})年)?\s*([^)）]*)[)）]/);
  return { sale_price_man: price, sale_name: orNull(clean(inner?.[2] ?? "")), sale_year: inner?.[1] ? Number(inner[1]) : null };
}

/** 「1口:2.2万円/400口」→ 880（万円） */
export function parseClubPrice(s: string): number | null {
  const m = clean(s).match(/1口\s*[:：]\s*([\d.,億万]+円)\s*\/\s*([\d,]+)口/);
  if (!m) return null;
  const unit = parseYenMan(m[1]);
  const n = Number(m[2].replace(/,/g, ""));
  return unit && n ? Math.round(unit * n * 10) / 10 : null;
}

/** 「芝1600」「ダ1200」「障3000」→ 馬場と距離 */
export function parseCourse(s: string): { surface: string | null; distance: number | null } {
  const m = clean(s).match(/(芝|ダ|障)\D*?(\d{3,4})/);
  return m ? { surface: m[1], distance: Number(m[2]) } : { surface: null, distance: null };
}
