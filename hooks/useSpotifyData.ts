import useSWR from 'swr';
import axios from '@/lib/axios';
import type { RecentlyPlayedResponse, PersonaTrackItem } from '@/lib/spotify-types';

// SWR用のaxiosフェッチャー関数
const axiosFetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};

interface UseSpotifyDataReturn {
  data: (RecentlyPlayedResponse & { personaTracks: PersonaTrackItem[] }) | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}

/**
 * Spotifyの再生履歴データを取得するカスタムhook
 * axiosを使用してHTTPリクエストを実行
 * @param enabled - データ取得を有効にするかどうか
 * @returns SWRのレスポンスオブジェクト
 */
export function useSpotifyData(enabled: boolean): UseSpotifyDataReturn {
  const { data, error, isLoading, mutate } = useSWR<RecentlyPlayedResponse & { personaTracks: PersonaTrackItem[] }>(
    enabled ? '/api/recently-played' : null,
    axiosFetcher,
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
      // リトライ間隔を指数的に増加
      errorRetryInterval: 1000, // 1秒から開始
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
