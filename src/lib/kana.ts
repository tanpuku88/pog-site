/** ひらがなをカタカナに、全角英数を半角にそろえる（馬名検索用） */
export function normalizeQuery(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
    .trim();
}
