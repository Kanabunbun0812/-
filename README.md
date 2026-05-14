# Mutual Match (MM)

飲み会・合コン・イベントで、参加者が気になる相手に投票し、両想いだけを発表するWebアプリです。

## 構成

- Vite + React + Tailwind CSS
- Supabase（データベース）
- Vercel（ホスティング）

## ローカル開発

```bash
npm install
npm run dev
```

## デプロイ

### Vercel

1. GitHubリポジトリをVercelにインポート
2. Build command: `npm run build`
3. Output directory: `dist`
4. 環境変数を設定:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `VITE_SUPABASE_URL` | Yes | Supabase プロジェクトURL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `VITE_ADSENSE_CLIENT` | No | Google AdSense クライアントID（未設定時は広告非表示） |
| `VITE_ADSENSE_SLOT` | No | Google AdSense スロットID（未設定時は広告非表示） |

## Supabase セットアップ

### 初回セットアップ

`supabase_schema_draft.sql` を Supabase SQL Editor で実行してください。

### アップグレード（v2: ラウンド対応）

`supabase_upgrade.sql` を Supabase SQL Editor で実行してください。以下が追加されます:

- `rooms.current_round` (int) - 現在の投票ラウンド
- `rooms.target_mode` (text) - 投票対象モード（opposite / all）
- `rooms.expires_at` (timestamptz) - 部屋の有効期限
- `votes.round_number` (int) - 投票ラウンド番号

**注意:** 開発中のため、既存の votes データは削除されます。

## RLS（Row Level Security）について

**現在 RLS は disabled（開発用）です。**

本番運用前に RLS を有効にし、適切なポリシーを設定してください。RLS が無効の状態では、anon key を知っていれば誰でもデータを読み書きできます。

## 部屋の自動削除について

- 部屋は作成から24時間後に削除する設計を想定しています（`expires_at` カラム）
- 現時点では手動削除ボタン（結果画面下部）を優先実装しています
- 自動削除は Supabase pg_cron または Edge Function で後続実装予定

## Realtime について

App.jsx には Supabase Realtime のサブスクリプションコードが含まれています。動作させるには:

1. Supabase ダッシュボード → Database → Replication
2. `rooms`, `members`, `votes` テーブルの Realtime を ON にする
3. Realtime が OFF でもアプリは正常動作します（手動リロードで更新）

## ページ構成

| パス | 内容 |
|------|------|
| `/` | トップページ |
| `/r/:roomCode` | 部屋ページ |
| `/privacy` | プライバシーポリシー |
| `/terms` | 利用規約 |
| `/contact` | お問い合わせ |

## 機能一覧

- 部屋作成（テーブル配置、席数、投票設定）
- 席登録（名前、性別）
- 本人確認 → 投票
- 両想い結果発表
- 第2回以降の投票ラウンド対応
- 部屋削除ボタン
- 自分に届いた矢印数の確認（オプション）
