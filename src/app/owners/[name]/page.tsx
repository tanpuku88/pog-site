import type { Metadata } from "next";
import { GroupDetail, groupMetadata } from "@/components/GroupDetail";
import { KINDS } from "@/lib/connections";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  return groupMetadata(KINDS.owner, decodeURIComponent(name));
}

export default async function Page({ params, searchParams }: { params: Promise<{ name: string }>; searchParams: Promise<{ area?: string }> }) {
  const { name } = await params;
  const { area } = await searchParams;
  return <GroupDetail kind={KINDS.owner} name={decodeURIComponent(name)} area={area === "nar" ? "nar" : area === "jra" ? "jra" : undefined} />;
}
