# Schedule Extension for Garoon

サイボウズ株式会社のグループウェア Garoon の予定通知を強化する Chrome 拡張機能（Manifest V3）です。デスクトップ通知と通知音で予定を見逃さず、ツールバーのポップアップから今日の予定を確認でき、ツールバーアイコンには次の予定の開始時刻が表示されます。さらに Garoon の日表示・週表示の予定画面には、現在時刻を示すラインがオーバーレイ表示されます。

## このプロジェクトについて

これは作者個人のサイドプロジェクトです。サイボウズの**公式製品ではありません**。本リポジトリの内容はすべて作者個人の成果物および見解であり、サイボウズの見解を示すものではありません。

「Garoon」はサイボウズ株式会社の登録商標です。本拡張機能が連携する対象を説明するためにのみ名称を使用しています。

## 機能

- 予定の開始前にデスクトップ通知する（任意で通知音を設定可能）
- ツールバーアイコンのバッジに、今日の次の予定の開始時刻を表示
- ツールバーのポップアップに今日の予定を一覧表示（終日予定や、終了済み・進行中・未開始の状態を区別）
- Garoon の日表示・週表示で現在時刻を示すラインを表示

## 開発

本プロジェクトは [pnpm](https://pnpm.io/)（`pnpm@10.33.0`）と webpack（`ts-loader` および `sass-loader`）を使用しています。

```sh
pnpm install
pnpm build:dev   # 開発ビルド（dist/ に出力）
pnpm build       # 本番ビルド（NODE_ENV=production）+ scripts/zip.sh で archive.zip を生成
pnpm start       # webpack --watch（ファイル変更を監視）
pnpm icons       # src/icon/calendar.svg から sharp で PNG アイコンを再生成
```

## 謝辞

本プロジェクトは Shinya Kamiaka 氏による [kamiaka/garoon-chrome-extension](https://github.com/kamiaka/garoon-chrome-extension)（MIT License）を出発点としており、そこから大幅に改変したものです。詳細は [LICENSE](./LICENSE) を参照してください。

## アイコン

ポップアップで使用しているアイコンは、[Lucide](https://lucide.dev/) を [ISC License](https://lucide.dev/license) のもとで利用しています。

## ライセンス

MIT License のもとで公開しています。詳細は [LICENSE](./LICENSE) を参照してください。
