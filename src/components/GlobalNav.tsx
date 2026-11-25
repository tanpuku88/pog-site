"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "トップ", match: (p: string) => p === "/" },
  { href: "/popular", label: "注目馬30傑", match: (p: string) => p.startsWith("/popular") },
  { href: "/shinba", label: "新馬戦", match: (p: string) => p.startsWith("/shinba") },
  { href: "/data", label: "POGデータ", match: (p: string) => ["/data", "/sires", "/trainers", "/owners", "/breeders"].some((x) => p.startsWith(x)) },
  { href: "/horses", label: "馬を探す", match: (p: string) => p.startsWith("/horses") || p.startsWith("/horse/") },
  { href: "/keibajo", label: "競馬場ガイド", match: (p: string) => p.startsWith("/keibajo") },
  { href: "/jyogai", label: "場外ガイド", match: (p: string) => p.startsWith("/jyogai") },
  { href: "/asia", label: "アジア競馬", match: (p: string) => p.startsWith("/asia") },
  { href: "/guide", label: "使い方", match: (p: string) => p.startsWith("/guide") },
];

/** ヘッダーの下のメニュー帯 */
export default function GlobalNav() {
  const path = usePathname();
  return (
    <nav className="gnav" aria-label="メインメニュー">
      <div className="gnav-in">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className={i.match(path) ? "on" : ""}>{i.label}</Link>
        ))}
      </div>
    </nav>
  );
}
