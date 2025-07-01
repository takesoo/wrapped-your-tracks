import useSWR from 'swr';
import type { RecentlyPlayedResponse, PersonaTrackItem } from '@/lib/spotify-types';

// SWR用のフェッチャー関数
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
});

interface UseSpotifyDataReturn {
  data: (RecentlyPlayedResponse & { personaTracks: PersonaTrackItem[] }) | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}

/**
 * Spotifyの再生履歴データを取得するカスタムhook
 * @param enabled - データ取得を有効にするかどうか
 * @returns SWRのレスポンスオブジェクト
 */
export function useSpotifyData(enabled: boolean): UseSpotifyDataReturn {
  const { data, error, isLoading, mutate } = useSWR<RecentlyPlayedResponse & { personaTracks: PersonaTrackItem[] }>(
    enabled ? '/api/recently-played' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err: Error) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Spotify data fetch failed:', err);
        }
      },
      shouldRetryOnError: true,
      errorRetryCount: 3,
      // キャッシュの有効期限を設定（5分）
      dedupingInterval: 5 * 60 * 1000,
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
