// シェア用リンクの署名と、Xに貼る文の組み立て（データベースに依存しない）
import { createHmac, timingSafeEqual } from "node:crypto";

/** シェアの対象。"all" は大会の順位表、それ以外は参加者のユーザーID */
export type ShareTarget = { groupId: string; who: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function secret() {
  const s = process.env.SHARE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("SHARE_SECRET か SUPABASE_SERVICE_ROLE_KEY が必要です");
  return s;
}

/** 推測できない短い署名（このリンクを知っている人だけが見られる） */
export function shareSig(t: ShareTarget, key = secret()) {
  return createHmac("sha256", `share:${key}`).update(`${t.groupId}:${t.who}`).digest("base64url").slice(0, 16);
}

export function verifyShare(t: ShareTarget, sig: string, key = secret()) {
  if (!UUID.test(t.groupId) || !(t.who === "all" || UUID.test(t.who))) return false;
  const want = Buffer.from(shareSig(t, key));
  const got = Buffer.from(sig);
  return want.length === got.length && timingSafeEqual(want, got);
}

/** 公開されるシェアページのパス */
export function sharePath(t: ShareTarget, key = secret()) {
  return `/share/${t.groupId}/${t.who}/${shareSig(t, key)}`;
}

/** Xの投稿文（URLは別に付ける） */
export function shareText(o: {
  kind: "member" | "ranking";
  groupName: string;
  name?: string;
  rank?: number;
  members: number;
  points: number;
  topHorse?: string | null;
}) {
  const man = Math.round(o.points).toLocaleString("ja-JP");
  if (o.kind === "ranking") {
    return `POG大会「${o.groupName}」の順位表（${o.members}人）\n首位は${o.name ?? "-"}さん・${man}万円！\n#POG #ペーパーオーナーゲーム`;
  }
  const head = o.rank ? `いま${o.rank}位／${o.members}人・${man}万円` : `${man}万円`;
  const star = o.topHorse ? `\n稼ぎ頭は${o.topHorse}` : "";
  return `POG大会「${o.groupName}」の指名リスト\n${head}${star}\n#POG #ペーパーオーナーゲーム`;
}

/** 自分の指名リストの投稿文 */
export function myListShareText(
  groupName: string,
  me: { rank: number; points: number; horses: { horse_id: string; points: number }[] },
  members: number,
  horseMap: Map<string, { name: string }>,
) {
  const top = [...me.horses].sort((a, b) => b.points - a.points)[0];
  return shareText({
    kind: "member",
    groupName,
    rank: me.rank,
    members,
    points: me.points,
    topHorse: top && top.points > 0 ? horseMap.get(top.horse_id)?.name : null,
  });
}

export { xIntentUrl } from "./share-url";
