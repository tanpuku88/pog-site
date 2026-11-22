import Link from "next/link";
import { KIND_LIST, type Kind } from "@/lib/connections";

/** データページ（種牡馬・厩舎・馬主・生産牧場）の切り替え */
export function DataTabs({ current }: { current?: Kind | "hub" | "sales" }) {
  return (
    <nav className="data-tabs" aria-label="POGデータ">
      <Link href="/data" className={current === "hub" ? "on" : ""}>まとめ</Link>
      {KIND_LIST.map((k) => (
        <Link key={k.path} href={k.path} className={typeof current === "object" && current.path === k.path ? "on" : ""}>{k.label}</Link>
      ))}
      <Link href="/data/sales" className={current === "sales" ? "on" : ""}>セリ回収率</Link>
    </nav>
  );
}
