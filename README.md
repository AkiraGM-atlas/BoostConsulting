# BoostConsulting

会社紹介・サービス紹介サイトの開発環境です。Vite + TypeScript の静的サイト構成で、現在は起動確認用の準備中ページを表示します。

## セットアップ

Node.js 22.23.4 と npm を使用します。nvm を使う場合は `nvm install`、`nvm use` で `.nvmrc` のバージョンに切り替えます。

```sh
git clone https://github.com/AkiraGM-atlas/BoostConsulting.git
cd BoostConsulting
npm ci
npm run dev
```

表示先: http://127.0.0.1:5173 （使用中の場合は起動ログのURLを確認）。初期状態では環境変数や外部サービスの契約は不要です。

## コマンド

| コマンド                       | 用途                               |
| ------------------------------ | ---------------------------------- |
| `npm run dev`                  | 編集内容を即時反映する開発サーバー |
| `npm run check`                | 整形確認・型チェック・本番ビルド   |
| `npm run format`               | ファイルの整形                     |
| `npm run build`                | `dist/` に公開用ファイルを生成     |
| `npm run preview`              | ビルド後の表示確認                 |
| `npm audit --audit-level=high` | 依存パッケージの脆弱性確認         |

## 編集場所

- `index.html`: タイトル、説明文、会社・サービス紹介の本文
- `src/style.css`: 配色やレイアウト
- `src/main.ts`: 今後追加する画面の動き
- `public/`: 画像などを追加する場合に作成するフォルダー

## GitHubの自動チェック

mainへのpush・プルリクエストで、依存関係の再現インストール、整形確認、型チェック、ビルド、脆弱性監査を実行します。Dependabotが週次で更新候補を作成します。

現在は表示確認用ページのみのため、業務ロジックのテストはありません。フォームなどを実装する際に、その機能のテストを追加します。

## 公開について

公開先とドメインは未設定です。`dist/` を静的ホスティングに配置できます。サブディレクトリへ公開する場合は、Viteの `base` を公開パスに合わせて設定してください。

会社概要、サービス内容、問い合わせ先、必要なプライバシーポリシーを確定してから本公開してください。準備中ページの `noindex, nofollow` は、本公開時に削除します。

環境変数を追加する際は `.env.example` に変数名と説明だけを記録してください。`VITE_` で始まる変数はブラウザーへ公開されるため、秘密鍵などを入れないでください。

## 公式資料

- [Vite: 開発とビルド](https://vite.dev/guide/)
- [actions/checkout](https://github.com/actions/checkout)
- [actions/setup-node](https://github.com/actions/setup-node)
