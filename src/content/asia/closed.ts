import type { Photo } from "./types";
import { CLOSED_PHOTOS } from "./photos";

// 閉場した競馬場のコラム。2026-11-22 に Wikipedia（シンガポール・ターフクラブ、マカオ・ジョッキークラブ、
// タイ王立競馬場）とマレーシアのページの出典で確認。

export type ClosedTrack = { name: string; flag: string; years: string; body: string[]; photo?: Photo; source: { label: string; url: string } };

export const CLOSED: ClosedTrack[] = [
  {
    name: "シンガポール クランジ競馬場",
    flag: "sg",
    years: "1842年〜2024年10月5日",
    body: [
      "シンガポールの競馬は1842年10月4日に始まったクラブ（のちのシンガポール・ターフクラブ）から180年以上続きました。",
      "2023年6月5日に、住宅などに土地を使うため閉場が発表され、2024年10月5日のクランジ競馬場の開催が最後のレースになりました。土地は2027年までに国へ返されます。",
    ],
    photo: CLOSED_PHOTOS.singapore,
    source: { label: "Wikipedia シンガポール・ターフクラブ", url: "https://en.wikipedia.org/wiki/Singapore_Turf_Club" },
  },
  {
    name: "マカオ タイパ競馬場",
    flag: "mo",
    years: "1980年〜2024年3月30日",
    body: [
      "1980年に繋駕速歩（トロット）のクラブとして始まり、1989年からサラブレッドの競馬を開いてきました。",
      "2024年3月30日の開催が最後となり、マカオ・ジョッキークラブは4月1日に運営を終えました。",
    ],
    photo: CLOSED_PHOTOS.macau,
    source: { label: "Wikipedia マカオ・ジョッキークラブ", url: "https://en.wikipedia.org/wiki/Macau_Jockey_Club" },
  },
  {
    name: "マレーシア ペナン競馬場",
    flag: "my",
    years: "1864年〜2025年5月31日",
    body: ["1864年創立のペナン・ターフクラブは、2025年5月31日の開催を最後に閉場しました。マレーシアの競馬はセランゴールとペラで続いています。"],
    source: { label: "Wikipedia ペナン・ターフクラブ", url: "https://en.wikipedia.org/wiki/Penang_Turf_Club" },
  },
  {
    name: "タイ ナーンルーン競馬場（タイ王立競馬場）",
    flag: "th",
    years: "〜2018年9月16日",
    body: ["バンコクのナーンルーン競馬場は2018年9月16日のレースを最後に閉場し、跡地はラーマ9世記念公園になりました。バンコクでは王立バンコク・スポーツクラブの競馬が続いています。"],
    source: { label: "Wikipedia タイ王立競馬場", url: "https://en.wikipedia.org/wiki/Royal_Turf_Club_of_Thailand" },
  },
];
