import { requireGroup } from "@/lib/group-data";
import Tabs from "./Tabs";

export default async function GroupLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { group } = await requireGroup(id);
  return (
    <>
      <h1 style={{ marginBottom: 4 }}>{group.name}</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        {group.crop_year}年生まれ世代 ・ {group.season_start.replaceAll("-", "/")}〜{group.season_end.replaceAll("-", "/")} ・ 1人{group.picks_per_member}頭
      </p>
      <Tabs id={id} />
      {children}
    </>
  );
}
