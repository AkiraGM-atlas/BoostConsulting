# BoostConsulting

atlas-platform と同系統の Web アプリ開発環境です。会社紹介サイト用の Vite 構成を置き換え、業務機能を追加するための基盤を用意しています。

## 構成

- Next.js 16.3.8（App Router）/ React 19.2.3 / TypeScript 5.9.3
- Tailwind CSS 3.4.17
- Prisma 6.12.0 / PostgreSQL 16
- Clerk 7.9.9（Boost専用の鍵を設定するとログインを有効化）
- Vitest 4.1.12 / Playwright 1.62.1 / ESLint / Prettier
- Node.js 22 / npm 10、Vercel向け東京リージョン設定

主要バージョンは2026-10-22に確認したatlasのlockfileに合わせています。Vitestとその依存パッケージは修正版（Vitest 4.1.12、Vite 8.1.6、postcss-selector-parser 7.1.7）に更新しています。

## 起動

Node.js 22.23.4 と npm 10 を使用します。nvm を使う場合は `nvm install`、`nvm use` で `.nvmrc` に合わせます。

```sh
git clone https://github.com/AkiraGM-atlas/BoostConsulting.git
cd BoostConsulting
cp .env.example .env
npm ci
npm run dev
```

http://localhost:3000 を開きます。外部サービスの鍵がなくてもトップページと `/api/health` は動きます。トップは中立的な初期画面です。

## データベース

Docker Compose v2が使える環境で `npm run db:up` を実行します。Boost専用PostgreSQLをローカルの5433番ポートで起動し、atlasのDBと分離します。

```sh
npm run db:up
npm run db:validate
npm run db:check
```

`compose.yaml` と `.env.example` の接続情報はローカル開発専用です。停止は `npm run db:down`。データは名前付きボリュームに保持します。

業務用モデルとマイグレーションは、機能の要件が決まってから `prisma/schema.prisma` に追加します。変更後は `npm run db:migrate -- --name <変更名>`。本番への適用は `npm run db:deploy` を使用します。atlasのテーブルやデータ、PostGISを使う物件検索機能はコピーしていません。

本番DBを接続する場合、`DATABASE_URL` にアプリ接続先、`DIRECT_URL` にマイグレーション用の直接接続先を設定します。

## 認証

Boost専用のClerkアプリを用意し、次の値を `.env` に設定します。

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

設定後に再ビルド・再起動すると `/sign-in`、`/sign-up`、`/dashboard` を利用できます。`/dashboard` はログイン必須です。認証キーが未設定・片方のみの場合は保護対象を503で閉じ、認証なしの画面に切り替えません。新しいページ・APIも、公開一覧に追加しない限り認証を要求します。DB操作・APIを追加するときはその処理内でも利用者と権限を確認してください。

Clerkの新規アプリ作成や実際のサインイン確認はこの初期構築には含まれません。atlasのClerkアプリやユーザーは共有しません。

## 開発コマンド

| コマンド                      | 内容                                   |
| ----------------------------- | -------------------------------------- |
| `npm run dev`                 | 開発サーバー                           |
| `npm run check`               | 整形・lint・型・単体テスト・ビルド     |
| `npm run build` / `npm start` | 本番ビルド / 配信                      |
| `npm run test:e2e`            | ビルド後にブラウザ検証（PC・モバイル） |
| `npm run format`              | 整形                                   |
| `npm run db:generate`         | Prisma Client生成                      |
| `npm run db:validate`         | DBスキーマ検証                         |
| `npm run db:studio`           | DBの閲覧・編集                         |

初回のブラウザ検証は `npx playwright install chromium` を実行してください。E2Eは認証未設定の初期状態を検証するため、Clerkキーを入れないビルドで実行します。`/api/health` はプロセスの応答確認だけを行い、DBやClerkの疎通を保証しません。

## GitHub・Vercel

GitHub ActionsはmainへのpushとPRで再現インストール、整形・lint・型・単体テスト・ビルド・ブラウザ検証・依存監査を実行します。DependabotがnpmとActionsの更新候補を作成します。

`vercel.json` にNext.js、`npm ci`、`npm run build`、東京リージョン `hnd1` を設定済みです。Vercelプロジェクトとの接続、Boost専用DB・Clerkの作成、環境変数の登録、実際のデプロイは別途必要です。ドメインやatlasの外部サービス設定は引き継いでいません。

## ファイル

- `src/app/`: 画面とAPI
- `src/proxy.ts`: 公開ルート一覧と認証処理
- `src/lib/`: 共通処理
- `prisma/`: DBスキーマ
- `e2e/`: ブラウザテスト
- `.github/workflows/ci.yml`: 自動チェック

## 現時点の検証と制約

ビルド・型・lint・単体テスト・PC/モバイルのブラウザテストを確認しています。外部Clerkの鍵が未設定なので実アカウントのサインインは未検証です。作業端末にDockerがないため、PostgreSQLの実接続はGitHub Actionsのサービスコンテナで確認する設定にしています。

2026-10-22の全依存監査では、開発ツール由来の `braces <=3.0.3` に未修正の [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) が残っています。7つの依存ノードで検出されますが、原因は同じ1件です。本番依存のみの監査は0件です。全依存の監査ゲートは維持しているためCIはこの箇所で失敗します。修正版または依存構成の変更が必要です。

## 公式資料

- [Next.js](https://nextjs.org/docs/app/getting-started/installation)
- [Clerk](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [Prisma 6](https://www.prisma.io/docs/orm/v6/reference/prisma-schema-reference)
- [actions/checkout](https://github.com/actions/checkout)
- [actions/setup-node](https://github.com/actions/setup-node)
