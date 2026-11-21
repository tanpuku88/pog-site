// シェア画像の日本語フォント。Google Fonts から、画像に使う文字だけを取り寄せる（数十KBで済む）

type Font = { name: string; data: ArrayBuffer; weight: 400 | 700 | 900; style: "normal" };

async function loadOne(text: string, weight: 400 | 700 | 900): Promise<Font | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&text=${encodeURIComponent(text)}`,
      { cache: "force-cache" },
    ).then((r) => r.text());
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const data = await fetch(src, { cache: "force-cache" }).then((r) => r.arrayBuffer());
    return { name: "Noto Sans JP", data, weight, style: "normal" };
  } catch {
    return null;
  }
}

/** text に含まれる文字のフォント（取れなければ空配列。そのときは標準フォントで描く） */
export async function ogFonts(text: string): Promise<Font[]> {
  const chars = [...new Set([...text, ..."0123456789,.万円位人頭勝戦/／・POG"])].join("");
  const fonts = await Promise.all([loadOne(chars, 400), loadOne(chars, 900)]);
  return fonts.filter((f): f is Font => !!f);
}
