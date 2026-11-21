// netkeiba からページを取得する。
// サーバーへの負荷を抑えるため、連続アクセスの間は必ず待つこと（politeFetch を使う）。
import iconv from "iconv-lite";

const USER_AGENT =
  "Mozilla/5.0 (compatible; POG-site/0.1; personal POG league tool, low frequency)";

export type FetchedPage = { url: string; html: string };

function detectCharset(contentType: string | null, head: Buffer): string {
  const fromHeader = contentType?.match(/charset=([\w-]+)/i)?.[1];
  if (fromHeader) return fromHeader.toLowerCase();
  const sniff = head.subarray(0, 2048).toString("latin1");
  const fromMeta = sniff.match(/charset=["']?([\w-]+)/i)?.[1];
  if (fromMeta) return fromMeta.toLowerCase();
  return "euc-jp";
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "ja" },
    redirect: "follow",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`netkeiba ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const charset = detectCharset(res.headers.get("content-type"), buf);
  const html = new TextDecoder(charset === "x-euc-jp" ? "euc-jp" : charset).decode(buf);
  return { url: res.url || url, html };
}

let lastAccess = 0;
const MIN_INTERVAL_MS = Number(process.env.NETKEIBA_INTERVAL_MS ?? 3000);

/** 前回のアクセスから最低 MIN_INTERVAL_MS 待ってから取得する */
export async function politeFetch(url: string): Promise<FetchedPage> {
  const wait = lastAccess + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastAccess = Date.now();
  return fetchPage(url);
}

/** EUC-JP でパーセントエンコードする（netkeiba の検索パラメータ用） */
export function encodeEucJp(s: string): string {
  const bytes = iconv.encode(s, "EUC-JP");
  let out = "";
  for (const b of bytes) {
    const c = String.fromCharCode(b);
    out += /[A-Za-z0-9\-_.~]/.test(c) ? c : "%" + b.toString(16).toUpperCase().padStart(2, "0");
  }
  return out;
}

export const horsePageUrl = (id: string) => `https://db.netkeiba.com/horse/${id}/`;
export const horsePedUrl = (id: string) => `https://db.netkeiba.com/horse/ped/${id}/`;
export const horseResultUrl = (id: string) => `https://db.netkeiba.com/horse/result/${id}/`;
export const horseSearchUrl = (word: string) =>
  `https://db.netkeiba.com/?pid=horse_list&match=partial_match&list=100&word=${encodeEucJp(word)}`;
/** 年齢で絞った馬一覧（世代の一括取り込み用）。page は1から */
export const horseListByAgeUrl = (age: number, page: number) =>
  `https://db.netkeiba.com/?pid=horse_list&match=partial_match&under_age=${age}&over_age=${age}&sort=name&list=100&page=${page}`;
export const raceListUrl = (yyyymmdd: string) =>
  `https://race.netkeiba.com/top/race_list_sub.html?kaisai_date=${yyyymmdd}`;
export const shutubaUrl = (raceId: string) =>
  `https://race.netkeiba.com/race/shutuba.html?race_id=${raceId}`;

/** netkeiba の馬ページURLまたは馬IDから、馬IDを取り出す */
export function extractHorseId(input: string): string | null {
  const s = input.trim();
  if (/^\d{10}$/.test(s)) return s;
  const m = s.match(/netkeiba\.com\/horse\/(?:result\/|ped\/)?(\w{10})/);
  return m ? m[1] : null;
}
