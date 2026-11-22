import type { RaceTrack, Region } from "./types";
import { JRA_TRACKS } from "./jra";
import { NAR_TRACKS } from "./nar";
import { KEIBAJO_PHOTOS } from "./photos";

const KEIBA_GO = { label: "地方競馬情報サイト（地方競馬全国協会）", url: "https://www.keiba.go.jp/" };

/** 公開中の競馬場（中央→地方の順）。地方競馬には地方競馬全国協会の公式サイトも公式リンクとして足す */
export const TRACKS: RaceTrack[] = [...JRA_TRACKS, ...NAR_TRACKS].map((t) => ({
  ...t,
  photos: t.photos ?? KEIBAJO_PHOTOS[t.slug],
  links: t.org === "NAR" ? [...(t.links ?? []), KEIBA_GO] : t.links,
}));

export const REGIONS: Region[] = ["北海道", "東北", "関東", "北陸・東海", "関西", "四国・九州"];

export function findTrack(slug: string) {
  return TRACKS.find((t) => t.slug === slug);
}
