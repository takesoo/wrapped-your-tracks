import { NextRequest, NextResponse } from 'next/server';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import OpenAI from 'openai';
import type { SpotifyUserData, AIPersonaResponse } from '@/lib/types';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id_here';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',
});

async function getAccessTokenFromRequest(request: NextRequest): Promise<string | null> {
  const accessToken = request.cookies.get('spotify_access_token')?.value;
  return accessToken || null;
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token found. Please authenticate first.' },
        { status: 401 },
      );
    }

    // Spotify SDKを初期化
    const sdk = SpotifyApi.withAccessToken(SPOTIFY_CLIENT_ID, {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: '',
    });

    // Spotifyデータを並列取得
    const [topTracks, topArtists, recentlyPlayed] = await Promise.all([
      sdk.currentUser.topItems('tracks', 'short_term', 10),
      sdk.currentUser.topItems('artists', 'short_term', 10),
      sdk.player.getRecentlyPlayedTracks(10),
    ]);

    // レスポンス用のSpotifyデータを整形
    const spotifyData: SpotifyUserData = {
      topTracks: topTracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => ({
          id: artist.id,
          name: artist.name,
        })),
        album: {
          id: track.album.id,
          name: track.album.name,
          images: track.album.images,
        },
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        external_urls: track.external_urls,
      })),
      topArtists: topArtists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers.total,
        images: artist.images,
        external_urls: artist.external_urls,
      })),
      recentlyPlayed: recentlyPlayed.items.map(item => ({
        track: {
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map(artist => ({
            id: artist.id,
            name: artist.name,
          })),
        },
        played_at: item.played_at,
      })),
    };

    // AIペルソナ生成のためのデータ準備
    const artistNames = spotifyData.topArtists.map(artist => artist.name);
    const trackNames = spotifyData.topTracks.map(track =>
      `${track.name} by ${track.artists[0]?.name || 'Unknown'}`,
    );
    const genres = [...new Set(spotifyData.topArtists.flatMap(artist => artist.genres))];
    const avgPopularity = spotifyData.topArtists.reduce((sum, artist) => sum + artist.popularity, 0) / spotifyData.topArtists.length;

    // AIペルソナ生成（並列実行）
    const [personaCompletion, styleCompletion] = await Promise.all([
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'あなたは音楽分析の専門家で、ユーザーの音楽的嗜好から個性的なペルソナを作成することができます。日本語で魅力的で親しみやすいペルソナを作成してください。',
          },
          {
            role: 'user',
            content: `
あなたは音楽の専門家です。以下のユーザーの週間音楽データを分析して、その人の音楽的ペルソナを日本語で生成してください。

トップアーティスト: ${artistNames.join(', ')}
トップトラック: ${trackNames.join(', ')}
主要ジャンル: ${genres.slice(0, 10).join(', ')}
平均人気度: ${Math.round(avgPopularity)}

以下の要素を含む、魅力的で個性的なペルソナを150-200文字で作成してください：
- 音楽的傾向の分析
- 性格的特徴の推測
- ユニークで親しみやすい表現
- ポジティブなトーン
            `,
          },
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '音楽データから簡潔なスタイル分析を日本語で作成してください。',
          },
          {
            role: 'user',
            content: `以下の音楽データから、この人の音楽スタイルを一言で表現してください（30文字以内）：
            ジャンル: ${genres.slice(0, 5).join(', ')}
            人気度: ${Math.round(avgPopularity)}`,
          },
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    ]);

    const persona = personaCompletion.choices[0]?.message?.content || 'あなたは音楽を愛する素敵な人です。';
    const musicStyle = styleCompletion.choices[0]?.message?.content || '多様な音楽愛好家';

    const aiPersona: AIPersonaResponse = {
      persona,
      musicStyle,
      insights: {
        topGenres: genres.slice(0, 5),
        averagePopularity: Math.round(avgPopularity),
        diversityScore: genres.length,
        topArtistsCount: spotifyData.topArtists.length,
        topTracksCount: spotifyData.topTracks.length,
      },
    };

    return NextResponse.json({
      spotifyData,
      aiPersona,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating summary:', error);

    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'Invalid or expired access token. Please re-authenticate.' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate music summary' },
      { status: 500 },
    );
  }
}
