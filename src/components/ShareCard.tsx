import { siteOrigin } from "@/lib/site-origin";
import { sharePath } from "@/lib/share";
import { todayJst } from "@/lib/util";
import ShareButtons from "@/components/ShareButtons";

/** 指名リスト・順位表を画像付きでシェアするカード（サーバー側でリンクを作る） */
export default async function ShareCard({ groupId, who, title, note, text }: { groupId: string; who: string; title: string; note: string; text: string }) {
  const origin = await siteOrigin();
  const path = sharePath({ groupId, who });
  const day = todayJst().replace(/-/g, "");
  return (
    <div className="card">
      <strong>{title}</strong>
      <div className="muted" style={{ margin: "4px 0 10px" }}>{note}</div>
      <ShareButtons
        url={`${origin}${path}?d=${day}`}
        imageUrl={`${path}/image?d=${day}`}
        text={text}
        fileName={`pog-${who === "all" ? "ranking" : "list"}-${day}.png`}
      />
    </div>
  );
}
