/**
 * Wikimedia Commons の画像URLを表示サイズに合わせて縮小する。
 * 一覧カード（高さ120〜140px）に 960px の画像を読むと重いので、小さいサムネイルに差し替える。
 * 注意：Wikimedia は標準サイズ（120/250/330/500/960/1280/1920/3840px）以外の幅だと
 * 400 エラーを返すため、希望幅以上の最小の標準サイズに丸める。
 * Wikimedia 以外のURLはそのまま返す。
 */
const STEPS = [120, 250, 330, 500, 960, 1280, 1920, 3840];

export function sizedPhoto(src: string, width: number): string {
  const step = STEPS.find((s) => s >= width);
  if (!step) return src;
  // サムネイル形式: .../thumb/<path>/<file>/<N>px-<file>
  const thumb = src.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/.+\/)(\d+)px-(.+)$/);
  if (thumb) return `${thumb[1]}${step}px-${thumb[3]}`;
  // 原寸形式: .../commons/<path>/<file> → サムネイル形式に変換
  const orig = src.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(.+)\/([^/]+)$/);
  if (orig) return `https://upload.wikimedia.org/wikipedia/commons/thumb/${orig[1]}/${orig[2]}/${step}px-${orig[2]}`;
  return src;
}
