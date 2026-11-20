# POGサイト

指名馬の登録と成績集計をラクにするPOG（ペーパーオーナーゲーム）サイトです。

- 馬名・父・母の名前を数文字入れて、候補から選ぶだけで指名できる（ひらがなでもOK）
- netkeibaの馬ページのURLを貼る、または馬名を改行区切りで貼ってまとめて登録もできる
- 期間中のJRA本賞金（万円）の合計でランキングを自動集計
- 指名馬の今週の出走予定を一覧表示
- 招待リンクで参加者を集め、各自がログインして自分の馬を登録

## しくみ

| 部分 | 使っているもの |
| --- | --- |
| 画面 | Next.js（Vercel で公開） |
| データベースとログイン | Supabase（メールでログイン、パスワード不要） |
| 成績・出走予定の取得 | GitHub Actions が netkeiba を定期的に読みに行く |

netkeibaへのアクセスは、成績が1日1回（21:30）、出走予定が木・金・土の18:00だけです。1ページごとに3秒以上あけ、指名されている馬だけを読みます。将来はJRA-VANに切り替える予定です。

## 公開するまでの手順

### 1. Supabase（データベース）

1. https://supabase.com でアカウントを作り、「New project」を作る（Region は Tokyo）
2. 左メニューの「SQL Editor」を開き、`supabase/migrations/0001_init.sql` の中身を全部貼って「Run」
3. 「Authentication」→「Emails」→「Magic Link」のテンプレートに、次の1行を追加して保存（メールにログイン用コードが載るようになる）
   ```
   <p>ログインコード: {{ .Token }}</p>
   ```
4. 「Project Settings」→「API」で次の3つを控える
   - Project URL
   - anon（public）キー
   - service_role キー（秘密。人に見せない）

### 2. Vercel（サイトの公開）

1. https://vercel.com に GitHub アカウントでログインし、「Add New → Project」で `pog-site` を選ぶ
2. 「Environment Variables」に次を入れて「Deploy」
   | 名前 | 値 |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon キー |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role キー |
   | `NEXT_PUBLIC_SITE_URL` | 公開されたURL（例: `https://pog-site.vercel.app`） |
3. 公開URLが決まったら、Supabase の「Authentication」→「URL Configuration」で
   - Site URL に公開URL
   - Redirect URLs に `公開URL/auth/callback`
   を登録する

### 3. GitHub（成績の自動更新）

リポジトリの「Settings」→「Secrets and variables」→「Actions」で次の2つを登録する。

| 名前 | 値 |
| --- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role キー |

「Actions」タブから「成績の更新」「出走予定の更新」を手動で実行すると、すぐに試せます。

### 注意

- Supabase 標準のメール送信は1時間あたりの送信数がとても少ないです。参加者が一度にログインするとメールが届かないことがあるので、人数が増えたら Resend などのメール送信サービスを Supabase に設定してください。
- 無料の Supabase は1週間アクセスがないと停止しますが、毎日の成績更新が動いていれば止まりません。

## 開発者向け

```bash
npm install
cp .env.example .env.local   # 値を入れる
npm run dev                  # http://localhost:3000
npm test                     # 解析・集計・DB権限のテスト
npm run update:results       # 成績の更新（SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要）
npm run update:entries       # 出走予定の更新
```

- `src/lib/netkeiba/` netkeibaのページ取得と解析。列は見出しの文字で探すので、多少のレイアウト変更には耐える
- `src/lib/standings.ts` ポイント計算
- `supabase/migrations/` データベースの定義と権限（RLS）
