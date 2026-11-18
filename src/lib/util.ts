/** ログイン後の戻り先として安全なパスだけを許す */
export function safeNext(next?: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/** 日本時間の今日（YYYY-MM-DD） */
export function todayJst(now = new Date()) {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

export function formatMan(n: number) {
  return n.toLocaleString("ja-JP", { maximumFractionDigits: 1 });
}
