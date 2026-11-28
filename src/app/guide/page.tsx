import Link from "next/link";

export const metadata = {
  title: "使い方",
  description: "POG大会の作り方と参加のしかた。招待リンクで仲間を呼ぶ、馬名を入れて指名する、順位表を見るまでを順番に説明します。",
  alternates: { canonical: "/guide" },
};

export default function Guide() {
  return (
    <>
      <h1>使い方</h1>
      <div className="sec-title" style={{ marginTop: 0 }}><h2>はじめての方（参加者）</h2></div>
      <ol className="steps">
        <li><strong>招待リンクを開く</strong>主催者から届いたリンクを開きます。</li>
        <li><strong>登録・ログイン</strong>「新規登録」でメールアドレスとパスワードを決めます。表示名がランキングに出る名前になります。</li>
        <li><strong>馬を指名する</strong>「自分の指名馬」タブで、馬名や父・母の名前を数文字入れて選ぶだけ。netkeibaの馬ページのURLを貼っても、馬名をまとめて貼っても登録できます。「注目馬30傑」から選ぶこともできます。</li>
        <li><strong>あとは見るだけ</strong>成績・賞金・順位は毎晩自動で更新されます。指名馬の出走予定は「今週の出走」タブに出ます。</li>
      </ol>

      <div className="sec-title"><h2>主催者の方</h2></div>
      <ol className="steps">
        <li><strong>グループを作る</strong>トップページの「新しいグループを作る」から、大会名・対象の世代・指名頭数・期間を決めます。</li>
        <li><strong>招待リンクを送る</strong>グループの「設定」タブにある招待リンクを、LINEなどで参加者に送ります。</li>
        <li><strong>ルールはあとから変更可</strong>指名頭数や地方・海外の賞金を含めるかは「設定」タブで変えられます。</li>
      </ol>

      <div className="sec-title"><h2>よくある質問</h2></div>
      <div className="card">
        <p style={{ marginTop: 0 }}><strong>ポイントはどう計算しますか？</strong><br />大会期間中のJRAの本賞金（万円）の合計です。設定で地方・海外の賞金も含められます。</p>
        <p><strong>成績はいつ反映されますか？</strong><br />毎晩21:30ごろに自動で更新します。出走予定は木〜土曜の夕方に更新します。</p>
        <p style={{ marginBottom: 0 }}><strong>パスワードを忘れました</strong><br />ログイン画面の「メールのリンクで」からログインし、マイページで新しいパスワードを設定してください。</p>
      </div>
      <p style={{ textAlign: "center", marginTop: 24 }}><Link href="/login" className="btn">はじめる</Link></p>
    </>
  );
}
