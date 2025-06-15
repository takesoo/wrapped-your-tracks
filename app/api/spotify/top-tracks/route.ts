import { NextRequest, NextResponse } from 'next/server';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('spotify_access_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }

    // SpotifySDKを使用（型安全、自動エラーハンドリング、自動リトライ）
    const spotify = SpotifyApi.withAccessToken(
      process.env.SPOTIFY_CLIENT_ID || '',
      {
        access_token: token,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: request.cookies.get('spotify_refresh_token')?.value || '',
      },
    );

    // SDKの型安全なメソッドを使用
    const [topTracks, topArtists, recentTracks] = await Promise.all([
      spotify.currentUser.topItems('tracks', 'long_term', 10),
      spotify.currentUser.topItems('artists', 'long_term', 10),
      spotify.player.getRecentlyPlayedTracks(10),
    ]);

    console.log('topTracks', topTracks);
    console.log('topArtists', topArtists);
    console.log('recentTracks', recentTracks);

    return NextResponse.json({
      topTracks: topTracks.items,
      topArtists: topArtists.items,
      recentTracks: recentTracks.items,
    });

  } catch (error) {
    console.error('Spotify API error:', error);

    // SDKのエラーオブジェクトを適切に処理
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch Spotify data' },
      { status: 500 },
    );
  }
}
