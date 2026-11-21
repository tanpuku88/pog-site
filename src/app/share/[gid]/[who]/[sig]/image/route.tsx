import { loadShare } from "@/lib/share-data";
import { renderShareImage } from "@/lib/share-image";

// シェア画像（1200×630のPNG）。Xのカード表示や「画像を保存」に使う
export async function GET(_req: Request, { params }: { params: Promise<{ gid: string; who: string; sig: string }> }) {
  const { gid, who, sig } = await params;
  const d = await loadShare(gid, who, sig);
  if (!d) return new Response("Not found", { status: 404 });
  return renderShareImage(d);
}
