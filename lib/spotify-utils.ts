import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id_here';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'your_spotify_client_secret_here';

/**
 * アクセストークンをリフレッシュする
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
} | null> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error('Failed to refresh token:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Spotify SDKのインスタンスを作成する
 */
export function createSpotifySDK(accessToken: string): SpotifyApi {
  return SpotifyApi.withAccessToken(SPOTIFY_CLIENT_ID, {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: '',
  });
}

/**
 * 再生時間をフォーマットする（ミリ秒から mm:ss 形式）
 */
export function formatDuration(durationMs: number): string {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * アーティスト名を結合する
 */
export function formatArtists(artists: { name: string }[]): string {
  return artists.map(artist => artist.name).join(', ');
}

/**
 * 人気度スコアをレベルに変換する
 */
export function getPopularityLevel(popularity: number): string {
  if (popularity >= 80) return '超人気';
  if (popularity >= 60) return '人気';
  if (popularity >= 40) return '知る人ぞ知る';
  if (popularity >= 20) return 'アンダーグラウンド';
  return '隠れた名曲';
}

/**
 * ジャンルをカテゴリー化する
 */
export function categorizeGenres(genres: string[]): {
  mainstream: string[];
  alternative: string[];
  electronic: string[];
  traditional: string[];
  other: string[];
} {
  const categories = {
    mainstream: [] as string[],
    alternative: [] as string[],
    electronic: [] as string[],
    traditional: [] as string[],
    other: [] as string[],
  };

  genres.forEach(genre => {
    const lowerGenre = genre.toLowerCase();

    if (lowerGenre.includes('pop') || lowerGenre.includes('rock') || lowerGenre.includes('hip hop')) {
      categories.mainstream.push(genre);
    } else if (lowerGenre.includes('indie') || lowerGenre.includes('alternative') || lowerGenre.includes('punk')) {
      categories.alternative.push(genre);
    } else if (lowerGenre.includes('electronic') || lowerGenre.includes('techno') || lowerGenre.includes('house') || lowerGenre.includes('edm')) {
      categories.electronic.push(genre);
    } else if (lowerGenre.includes('jazz') || lowerGenre.includes('classical') || lowerGenre.includes('folk') || lowerGenre.includes('blues')) {
      categories.traditional.push(genre);
    } else {
      categories.other.push(genre);
    }
  });

  return categories;
}

/**
 * リスニングスコアを計算する（総合的な音楽活動度）
 */
export function calculateListeningScore(data: {
  tracksCount: number;
  artistsCount: number;
  genresCount: number;
  averagePopularity: number;
}): {
  score: number;
  level: string;
  description: string;
} {
  // 各要素にウェイトを付けてスコア計算
  const diversityScore = Math.min(data.genresCount * 2, 20); // ジャンル多様性 (max 20)
  const discoveryScore = Math.max(20 - (data.averagePopularity / 5), 0); // 発見力 (人気度が低いほど高得点, max 20)
  const volumeScore = Math.min((data.tracksCount + data.artistsCount) / 2, 30); // 聴取量 (max 30)
  const engagementScore = 30; // ベースエンゲージメント (max 30)

  const totalScore = Math.round(diversityScore + discoveryScore + volumeScore + engagementScore);

  let level: string;
  let description: string;

  if (totalScore >= 85) {
    level = '音楽マエストロ';
    description = '音楽への造詣が深く、幅広いジャンルを愛する真の音楽家';
  } else if (totalScore >= 70) {
    level = '音楽愛好家';
    description = '音楽に対する情熱が強く、新しい発見を楽しむ';
  } else if (totalScore >= 55) {
    level = '音楽好き';
    description = '音楽を日常的に楽しみ、お気に入りを大切にする';
  } else if (totalScore >= 40) {
    level = '音楽リスナー';
    description = '音楽を生活の一部として楽しんでいる';
  } else {
    level = '音楽入門者';
    description = '音楽の世界を探索し始めている';
  }

  return {
    score: totalScore,
    level,
    description,
  };
}
