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
- **@openai/agents** - AIエージェント統合によるペルソナ生成
- **axios** - HTTP通信ライブラリ（統一されたエラーハンドリング付き）
- **SWR** - データフェッチングとキャッシュ管理
- **Recharts** - データ可視化チャート
- **Lucide React** - アイコン
- **Radix UI** - shadcn/uiのベースコンポーネント
- **Class Variance Authority** - コンポーネントスタイリングパターン

### 認証とAPI統合
- **NextAuth 4.24.11を使用したSpotify OAuth実装**
- `/pages/api/auth/[...nextauth].ts`でNextAuthハンドラーを実装
- `/lib/auth.ts`でSpotify Provider設定
- AIペルソナ生成のためのOpenAI GPT-4o統合（@openai/agents使用）
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
- `/pages/api/auth/[...nextauth].ts` - NextAuth認証ハンドラー（Spotify OAuth）
- `/api/recently-played` - 過去50件の視聴履歴と整形済みペルソナデータを提供
- `/api/ai/persona` - 音楽データに基づいてAIペルソナを生成（@openai/agents使用）
- `/api/summary` - 統合された音楽サマリーデータを提供

### コンポーネントアーキテクチャ
- カスタムスタイリングでshadcn/uiコンポーネント（Button、Card、Badge）を使用
- コンポーネントは`components/ui/`に配置
- パスエイリアス設定: `@/components`、`@/lib/utils`、`@/hooks`
- 全コンポーネントはTailwindを使用してスタイリング（グラデーションとグラスモーフィズム効果を多用）

### データフローとカスタムhooks
アプリケーションは実際のSpotifyデータを効率的に処理：
- NextAuthによるSpotify OAuth認証でアクセストークンを管理
- **カスタムhooksアーキテクチャ**:
  - `useSpotifyData`: Spotify API通信（axios使用、リトライ機能付き）
  - `usePersonaGeneration`: AIペルソナ生成（30分キャッシュ）
  - `useLoadingProgress`: プログレス計算とローディング状態管理
  - `useSessionStorage`: デバウンス付きストレージ管理
- SWRによるインテリジェントキャッシュとエラーハンドリング
- axiosによる統一されたHTTP通信とエラーハンドリング

### 型システム
`lib/spotify-types.ts`の包括的なTypeScript定義：
- Spotify APIレスポンス型
- AIペルソナと音楽洞察インターフェース
- ユーザーデータ集約型
- Loading状態とプログレス管理型
- カスタムhooks用の型定義

### ユーティリティ関数
- `lib/spotify-utils.ts` - Spotify APIヘルパー、トークンリフレッシュ、データフォーマット
- `lib/utils.ts` - 一般的なユーティリティ関数とTailwindクラスのマージ
- `lib/axios.ts` - axios設定とインターセプター（タイムアウト、エラーハンドリング）
- `lib/debounce.ts` - パフォーマンス最適化用デバウンス関数

## 必要な環境変数

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

## 最新の技術仕様

### HTTP通信
- **axios**を使用した統一されたHTTP通信
- インターセプターによる自動エラーハンドリング
- 開発環境でのリクエスト/レスポンスログ
- 30秒タイムアウト設定

### データフェッチング
- **SWR**によるデータフェッチングとキャッシュ管理
- カスタムhooksによる関心の分離
- エラーリトライとキャッシュ戦略の最適化
- TypeScript型安全性の確保

### AIペルソナ生成
- **@openai/agents**による高度なAI統合
- 50件の視聴履歴ベースでの分析
- 時間帯、リピート傾向、多様性スコア等の詳細な洞察
- 150-200文字の日本語ペルソナ生成

## 個人設定
- 日本語で会話してください