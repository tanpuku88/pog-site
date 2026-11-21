// ブラウザでも使えるシェア用のURL組み立て

/** X（旧Twitter）の投稿画面を開くURL */
export function xIntentUrl(text: string, url: string) {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}
