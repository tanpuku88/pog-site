import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

export default async function Join({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { supabase, user } = await getUser();
  if (!user) redirect(`/login?next=/join/${encodeURIComponent(code)}`);
  const { data, error } = await supabase.rpc("join_group", { code });
  if (error || !data) {
    return (
      <>
        <h1>参加できませんでした</h1>
        <div className="card error">招待リンクが正しくないか、グループが削除されています。</div>
      </>
    );
  }
  redirect(`/g/${data}`);
}
