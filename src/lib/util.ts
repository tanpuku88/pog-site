/** ログイン後の戻り先として安全なパスだけを許す */
export function safeNext(next?: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/** 日本時間の今日（YYYY-MM-DD） */
export function todayJst(now = new Date()) {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** 本賞金（万円）の表示は整数に丸める（小数があると桁が増えて改行されやすいため） */
export function formatMan(n: number) {
  return Math.round(n).toLocaleString("ja-JP");
}
