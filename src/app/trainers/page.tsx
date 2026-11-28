import { GroupRanking } from "@/components/GroupRanking";
import { KINDS } from "@/lib/connections";
import { defaultSeason } from "@/lib/standings";

export const revalidate = 3600;
export const metadata = {
  title: `厩舎ランキング ${defaultSeason().crop_year}年生まれ2歳馬`,
  description: "POGのドラフトの参考に。厩舎ごとの2歳馬の頭数・勝ち上がり率・賞金・指名数と、前の世代の成績をまとめています。",
  alternates: { canonical: "/trainers" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ sort?: string; area?: string }> }) {
  const { sort, area } = await searchParams;
  return <GroupRanking kind={KINDS.trainer} sort={sort} area={area} />;
}
