# Wrapped Your Tracks

Next.js 15（App Router）を使用したSpotify Wrapped風の音楽統計ダッシュボードアプリです。

## 🚀 機能

- **Spotify認証**: OAuth 2.0を使用したセキュアな認証
- **音楽データ取得**: ユーザーのトップトラック・アーティスト・最近の再生履歴を取得
- **AIペルソナ生成**: OpenAI GPT-4oを使用してパーソナライズされた音楽ペルソナを生成
- **美しいUI**: Spotify風のダークテーマとモダンなデザイン
- **リアルタイム統計**: 週間の音楽統計とビジュアライゼーション

## 🛠 技術スタック

- **フロントエンド**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **バックエンド**: Next.js API Routes
- **認証**: Spotify Web API OAuth 2.0（直接実装）
- **AI**: OpenAI GPT-4o
- **データビジュアライゼーション**: Recharts
- **SDK**: Spotify Web API TypeScript SDK

## 📋 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NODE_ENV=development
```

## 🔧 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd wrapped-your-tracks
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Spotify Developer Appの作成

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)にアクセス
2. 新しいアプリを作成
3. Redirect URIに `http://localhost:3000/api/spotify/callback` を設定
4. Client IDとClient Secretを取得

### 4. OpenAI API Keyの取得

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. API Keyを作成
3. 環境変数に設定

### 5. 環境変数の設定

`.env.local` ファイルに取得した認証情報を設定してください。

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリを確認してください。

## 📁 プロジェクト構造

```
wrapped-your-tracks/
├── app/
│   ├── api/
│   │   ├── spotify/
│   │   │   ├── auth/route.ts         # Spotify OAuth認証
│   │   │   ├── callback/route.ts     # OAuth コールバック
│   │   │   └── top-tracks/route.ts   # トップトラック取得
│   │   ├── ai/
│   │   │   └── persona/route.ts      # AIペルソナ生成
│   │   └── summary/route.ts          # 統合サマリー
│   ├── loading/                      # ローディングページ
│   ├── summary/                      # サマリーページ
│   └── page.tsx                      # ランディングページ
├── components/
│   └── ui/                          # UIコンポーネント
├── lib/
│   ├── types.ts                     # TypeScript型定義
│   ├── utils.ts                     # ユーティリティ関数
│   └── spotify-utils.ts             # Spotify関連ユーティリティ
└── public/                          # 静的ファイル
```

## 🔗 API エンドポイント

### 認証関連
- `GET /api/spotify/auth` - Spotify認証開始
- `GET /api/spotify/callback` - OAuth コールバック処理

### データ取得
- `GET /api/spotify/top-tracks` - トップトラック・アーティスト取得
- `GET /api/summary` - 統合された音楽サマリー取得

### AI生成
- `POST /api/ai/persona` - AIペルソナ生成

## 🔐 認証について

このアプリケーションは**next-authを使用せず**、Spotify OAuth 2.0を直接実装しています。これにより：

- **軽量**: 不要な依存関係なし
- **学習効果**: OAuth 2.0の仕組みを理解できる
- **カスタマイズ**: Spotify特有の要件に柔軟に対応
- **透明性**: 認証フローが明確に見える

## 🚀 デプロイ

### Vercel へのデプロイ

1. [Vercel](https://vercel.com)でプロジェクトをインポート
2. 環境変数を設定
3. `SPOTIFY_REDIRECT_URI` をデプロイされたURLに更新
4. Spotify Developer DashboardでリダイレクトURIを更新

## 📝 使用方法

1. **認証**: ランディングページで「Connect with Spotify」をクリック
2. **権限付与**: Spotifyで必要な権限を許可
3. **データ処理**: 自動的にローディングページに遷移
4. **結果確認**: サマリーページで音楽統計とAIペルソナを確認

## 🎨 カスタマイズ

### テーマの変更
- `app/globals.css` でカラーパレットを調整
- `tailwind.config.js` でテーマをカスタマイズ

### AIペルソナの調整
- `app/api/ai/persona/route.ts` でプロンプトを修正
- `lib/spotify-utils.ts` で分析ロジックを調整

## 🔍 トラブルシューティング

### よくある問題

1. **認証エラー**: 環境変数とSpotify設定を確認
2. **AIペルソナが生成されない**: OpenAI API Keyを確認
3. **データが取得されない**: Spotifyの権限設定を確認

### ログの確認

```bash
# 開発環境でのログ確認
npm run dev
```

## 📄 ライセンス

このプロジェクトはMITライセンスのもとで公開されています。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 🙏 謝辞

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [OpenAI GPT-4o](https://openai.com/api/)
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
