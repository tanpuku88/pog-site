import type { Metadata } from "next";
import { GroupDetail, groupMetadata } from "@/components/GroupDetail";
import { KINDS } from "@/lib/connections";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  return groupMetadata(KINDS.breeder, decodeURIComponent(name));
}

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <GroupDetail kind={KINDS.breeder} name={decodeURIComponent(name)} />;
}
