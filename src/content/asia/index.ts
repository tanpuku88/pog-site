import type { CountryGuide, CountryStub } from "./types";
import { korea } from "./korea";
import { hongkong } from "./hongkong";
import { uae } from "./uae";
import { saudi } from "./saudi";
import { qatar } from "./qatar";
import { bahrain } from "./bahrain";
import { india } from "./india";
import { malaysia } from "./malaysia";
import { philippines } from "./philippines";
import { turkey } from "./turkey";
import { mongolia } from "./mongolia";
import { kazakhstan } from "./kazakhstan";
import { kyrgyzstan } from "./kyrgyzstan";
import { thailand } from "./thailand";
import { oman } from "./oman";
import { pakistan } from "./pakistan";
import { china } from "./china";
import { indonesia } from "./indonesia";
import { iran } from "./iran";
import { PHOTOS } from "./photos";
import { ROUTES } from "./routes";
import { OFFICIAL } from "./official";

/** 公開中の国。新しい国はここに足す */
export const COUNTRIES: CountryGuide[] = [korea, hongkong, china, mongolia, kazakhstan, kyrgyzstan, thailand, malaysia, indonesia, philippines, india, pakistan, uae, saudi, qatar, bahrain, oman, iran, turkey].map((c) => ({
  ...c,
  fromJapan: c.fromJapan ?? ROUTES[c.slug],
  photos: c.photos ?? PHOTOS[c.slug],
  official: c.official ?? OFFICIAL[c.slug],
}));

/** 準備中の国（一覧に「準備中」として出す） */
export const COMING_SOON: CountryStub[] = [];

export function findCountry(slug: string) {
  return COUNTRIES.find((c) => c.slug === slug);
}
