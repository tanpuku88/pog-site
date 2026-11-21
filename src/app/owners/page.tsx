import { GroupRanking } from "@/components/GroupRanking";
import { KINDS } from "@/lib/connections";
import { defaultSeason } from "@/lib/standings";

export const revalidate = 3600;
export const metadata = {
  title: `馬主ランキング ${defaultSeason().crop_year}年生まれ2歳馬 | POG`,
  description: "POGのドラフトの参考に。馬主ごとの2歳馬の頭数・勝ち上がり率・賞金・指名数と、前の世代の成績をまとめています。",
  alternates: { canonical: "/owners" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort } = await searchParams;
  return <GroupRanking kind={KINDS.owner} sort={sort} />;
}
