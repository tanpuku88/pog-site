"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "トップ", match: (p: string) => p === "/" },
  { href: "/popular", label: "人気馬30傑", match: (p: string) => p.startsWith("/popular") },
  { href: "/shinba", label: "新馬戦", match: (p: string) => p.startsWith("/shinba") },
  { href: "/sires", label: "種牡馬", match: (p: string) => p.startsWith("/sires") },
  { href: "/horses", label: "馬を探す", match: (p: string) => p.startsWith("/horses") || p.startsWith("/horse/") },
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
