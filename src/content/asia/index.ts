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

/** 公開中の国。新しい国はここに足す */
export const COUNTRIES: CountryGuide[] = [korea, hongkong, uae, saudi, qatar, bahrain, india, malaysia, philippines, turkey];

/** 準備中の国（一覧に「準備中」として出す） */
export const COMING_SOON: CountryStub[] = [];

export function findCountry(slug: string) {
  return COUNTRIES.find((c) => c.slug === slug);
}
