// 検索・共有向けの文字列づくり（データベースに依存しない）

export type PublicHorse = {
  id: string; name: string; sex: string | null; birth_year: number | null;
  sire: string | null; dam: string | null; damsire: string | null;
  trainer: string | null; owner: string | null; breeder: string | null;
  updated_at: string | null;
};

/** netkeibaの馬IDらしい文字列か（おかしなURLでデータベースを叩かないため） */
export const isHorseId = (id: string) => /^[0-9A-Za-z]{6,12}$/.test(id);

/** 招待コードの形（英数字のみ）。それ以外はデータベースに問い合わせない */
export const isInviteCode = (code: string) => /^[0-9A-Za-z]{6,40}$/.test(code);

/** 検索結果やタイトルに使う短い紹介文 */
export function horseDescription(h: PublicHorse, r: { starts: number; wins: number; prize: number }, picks: number) {
  const ped = [h.sire && `父${h.sire}`, h.dam && `母${h.dam}`, h.damsire && `母父${h.damsire}`].filter(Boolean).join("・");
  const age = h.birth_year ? `${h.birth_year}年生まれ` : "";
  const rec = r.starts === 0 ? "未出走" : `${r.starts}戦${r.wins}勝・本賞金${r.prize.toLocaleString("ja-JP")}万円`;
  return `${h.name}のPOG情報。${[age, h.sex, ped].filter(Boolean).join(" ")}。${h.trainer ? `厩舎：${h.trainer}。` : ""}成績：${rec}。このサイトでの指名数${picks}。`;
}

/** LINEやXに貼る招待文 */
export function inviteMessage(groupName: string, url: string) {
  return `POG大会「${groupName}」に参加しませんか？\nリンクを開いて登録すると、そのまま参加できます。\n${url}`;
}

/** 新しい招待コード（12文字の英数字） */
export function newInviteCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}
