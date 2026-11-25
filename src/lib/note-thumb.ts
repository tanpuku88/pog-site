// 注目コラム（note）のカード画像に重ねる文字を、記事の種類（予想／コラム）で切り替える。

export type NoteThumb = { kind: "yoso" | "column"; kicker: string; title: string; date: string | null };

const WEEK = "日月火水木金土";

function dateLabel(title: string, date: string | null, withRaceDay: boolean): string | null {
  if (withRaceDay) {
    const m = title.match(/(\d{1,2})月(\d{1,2})日\s*[（(]([月火水木金土日])/);
    if (m) return `${m[1]}/${m[2]}(${m[3]})`;
    const m2 = title.match(/(\d{1,2})月(\d{1,2})日/);
    if (m2) return `${m2[1]}/${m2[2]}`;
  }
  if (!date) return null;
  const d = new Date(new Date(date).getTime() + 9 * 3600_000); // 日本時間
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}(${WEEK[d.getUTCDay()]})`;
}

/** 記事タイトルから、画像に重ねる見出し・日付を決める */
export function noteThumb(title: string, date: string | null): NoteThumb {
  const isYoso = /予想|買い目|本命|狙い馬|推奨馬/.test(title);
  const derby = title.match(/\d{4}年ダービーへの道/)?.[0];
  if (isYoso) {
    const race = /新馬/.test(title) ? "新馬戦" : /未勝利/.test(title) ? "未勝利戦" : (title.match(/([^\s・「」【】]{2,10}(?:S|ステークス|賞|杯|カップ|C))/)?.[1] ?? "");
    return {
      kind: "yoso",
      kicker: derby ?? "火下遊の予想",
      title: race ? `${race}予想` : "レース予想",
      date: dateLabel(title, date, true),
    };
  }
  return { kind: "column", kicker: derby ?? "火下遊のnote", title: "コラム", date: dateLabel(title, date, false) };
}
