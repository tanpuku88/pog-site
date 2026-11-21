import { requireGroup } from "@/lib/group-data";
import { todayJst } from "@/lib/util";
import Tabs from "./Tabs";

const fmt = (d: string) => d.slice(5).replace("-", "/");

export default async function GroupLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { group } = await requireGroup(id);
  const start = Date.parse(group.season_start);
  const end = Date.parse(group.season_end);
  const today = Date.parse(todayJst());
  const pct = Math.min(100, Math.max(0, ((today - start) / (end - start)) * 100));
  const daysLeft = Math.max(0, Math.ceil((end - today) / 86400000));
  return (
    <>
      <div className="hero">
        <h1>{group.name}</h1>
        <div className="meta">
          <span>{group.crop_year}年生まれ世代</span>
          <span>1人{group.picks_per_member}頭</span>
          <span>{group.include_non_jra ? "JRA＋地方・海外の本賞金" : "JRA本賞金"}</span>
        </div>
        <div className="progress"><span style={{ width: `${pct}%` }} /></div>
        <div className="progress-label">
          <span>{group.season_start.slice(0, 4)}/{fmt(group.season_start)} 開幕</span>
          <span>{daysLeft > 0 ? `日本ダービーまであと${daysLeft}日` : "シーズン終了"}</span>
        </div>
        <Tabs id={id} />
      </div>
      {children}
    </>
  );
}
