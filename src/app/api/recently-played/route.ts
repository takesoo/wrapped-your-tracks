import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSpotifySDK } from '@/lib/spotify-utils';
import type { RecentlyPlayedResponse, PersonaTrackItem } from '@/lib/spotify-types';

export async function GET(_request: NextRequest) {
  try {
    // セッション情報を取得
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 },
      );
    }

    // Spotify SDKを初期化
    const spotify = createSpotifySDK(session.accessToken);

    // 過去50件の再生履歴を取得
    const recentlyPlayed = await spotify.player.getRecentlyPlayedTracks(50);
    console.log('recentPlayed', recentlyPlayed);

    // データを整理して返す
    const tracks = recentlyPlayed.items.map((item) => ({
      playedAt: item.played_at,
      track: {
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map(artist => ({
          id: artist.id,
          name: artist.name,
        })),
        album: {
          id: item.track.album.id,
          name: item.track.album.name,
          images: item.track.album.images,
        },
        duration_ms: item.track.duration_ms,
        popularity: item.track.popularity,
        preview_url: item.track.preview_url,
        external_urls: item.track.external_urls,
      },
    }));

    // Persona API用の形式も同時に生成
    const personaTracks: PersonaTrackItem[] = tracks.map((item) => ({
      track: {
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map((artist) => ({ name: artist.name })),
        album: { name: item.track.album.name },
      },
      played_at: item.playedAt,
    }));

    const response: RecentlyPlayedResponse = {
      tracks,
      total: recentlyPlayed.total || tracks.length,
      limit: recentlyPlayed.limit || 50,
    };

    return NextResponse.json({
      ...response,
      personaTracks, // Persona API用のデータも含める
    });

  } catch (error) {
    console.error('Error fetching recently played tracks:', error);

    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch recently played tracks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
