# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

このプロジェクトは、週間音楽リスニング統計を表示するSpotify Wrapped風インターフェースを作成するNext.js 15アプリケーションです。ユーザーを接続するランディングページ、ローディングアニメーション、実際の音楽データとAI生成ペルソナを表示するサマリーページで構成されています。

## 開発コマンド

- `npm run dev` - Turbopack付きで開発サーバーを起動
- `npm run build` - プロダクションアプリケーションをビルド
- `npm start` - プロダクションサーバーを起動
- `npm run lint` - コード品質のためESLintを実行
- `npm run lint:fix` - 自動修正付きでESLintを実行
- `npm run format` - ESLintでコードをフォーマット

## アーキテクチャ

### フロントエンドフレームワーク
- **Next.js 15** (App Routerアーキテクチャ)
- **TypeScript** (strict mode有効)
- **Tailwind CSS** (カスタムグラデーション配色でのスタイリング)
- **shadcn/ui** コンポーネントライブラリ (New Yorkスタイル)

### 主要な依存関係
- **@spotify/web-api-ts-sdk** - Spotify Web API統合
- **OpenAI** - AIペルソナ生成
- **Recharts** - データ可視化チャート
- **Lucide React** - アイコン
- **Radix UI** - shadcn/uiのベースコンポーネント
- **Class Variance Authority** - コンポーネントスタイリングパターン

### 認証とAPI統合
- **直接的なOAuth 2.0実装** (next-authは使用しない)
- `/api/spotify/`内のカスタムSpotify認証フロー
- AIペルソナ生成のためのOpenAI GPT-4o統合
- ユーザーデータ取得のための実際のSpotify API統合

### UIテーマ
アプリはSpotifyインスパイアされた色でダークテーマを使用：
- プライマリグリーン: `#1DB954` 
- アクセントシアン: `#00FFC2`
- アクセントブルー: `#33BBFF`
- 背景: `#0D0D0D` (とても暗い)
- テキスト: 白と`#A1A1A1`（ミュートテキスト用）

### ルート構造
- `/` - ヒーローセクションと機能カードのあるランディングページ
- `/loading` - データ処理をシミュレートするアニメーションローディングページ
- `/summary` - 実際のSpotifyデータ、チャート、AIペルソナを表示するメイン結果ページ

### APIルート
- `/api/spotify/auth` - Spotify OAuthフローを開始
- `/api/spotify/callback` - OAuthコールバックとトークン交換を処理
- `/api/spotify/top-tracks` - ユーザーのトップトラックとアーティストを取得
- `/api/summary` - 統合された音楽サマリーデータを提供
- `/api/ai/persona` - 音楽データに基づいてAIペルソナを生成

### コンポーネントアーキテクチャ
- カスタムスタイリングでshadcn/uiコンポーネント（Button、Card、Badge）を使用
- コンポーネントは`components/ui/`に配置
- パスエイリアス設定: `@/components`、`@/lib/utils`
- 全コンポーネントはTailwindを使用してスタイリング（グラデーションとグラスモーフィズム効果を多用）

### データフロー
アプリケーションは実際のSpotifyデータとモックデータの両方を処理：
- OAuth認証はAPI呼び出し用のトークンを保存
- ローディングページはSpotify APIから実際のユーザーデータを取得
- AIペルソナ生成は音楽嗜好分析でOpenAI GPT-4oを使用
- サマリーページはAI生成の洞察と統合された実際のデータを表示

### 型システム
`lib/types.ts`の包括的なTypeScript定義：
- Spotify APIレスポンス型
- AIペルソナと音楽洞察インターフェース
- ユーザーデータ集約型

### ユーティリティ関数
- `lib/spotify-utils.ts` - Spotify APIヘルパー、トークンリフレッシュ、データフォーマット
- `lib/utils.ts` - 一般的なユーティリティ関数とTailwindクラスのマージ

## 必要な環境変数

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here  
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
OPENAI_API_KEY=your_openai_api_key_here
```

## 個人設定
- 日本語で会話してください