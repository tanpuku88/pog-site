import Link from "next/link";
import { AREA_LABEL, AREAS, areaHref, type Area } from "@/lib/area";

/** 中央・地方の切り替え */
export function AreaTabs({ path, current, counts, extra }: { path: string; current: Area; counts?: Record<Area, number>; extra?: Record<string, string | undefined> }) {
  return (
    <nav className="area-tabs" aria-label="中央・地方">
      {AREAS.map((a) => (
        <Link key={a} href={areaHref(path, a, extra)} className={a === current ? "on" : ""}>
          {AREA_LABEL[a]}{counts && <small>{counts[a]}頭</small>}
        </Link>
      ))}
    </nav>
  );
}
