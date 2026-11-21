"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Tabs({ id }: { id: string }) {
  const path = usePathname();
  const base = `/g/${id}`;
  const tabs = [
    { href: base, label: "ランキング", on: path === base || path.startsWith(`${base}/m/`) },
    { href: `${base}/picks`, label: "自分の指名馬", on: path.startsWith(`${base}/picks`) },
    { href: `${base}/entries`, label: "今週の出走", on: path.startsWith(`${base}/entries`) },
    { href: `${base}/popular`, label: "人気馬30傑", on: path.startsWith(`${base}/popular`) },
    { href: `${base}/settings`, label: "設定", on: path.startsWith(`${base}/settings`) },
  ];
  return (
    <nav className="tabs">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className={t.on ? "on" : ""}>{t.label}</Link>
      ))}
    </nav>
  );
}
