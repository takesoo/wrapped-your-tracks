import useSWR from 'swr';
import axios from '@/lib/axios';
import type { PersonaTrackItem, PersonaData } from '@/lib/spotify-types';

// ペルソナ生成用のaxiosフェッチャー
const personaAxiosFetcher = async ([url, tracks]: [string, PersonaTrackItem[]]) => {
  if (!tracks || tracks.length === 0) return null;

  const response = await axios.post(url, {
    recentTracks: tracks,
  });

  return response.data;
};

interface UsePersonaGenerationReturn {
  data: PersonaData | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}

/**
 * AIペルソナを生成するカスタムhook
 * axiosを使用してPOSTリクエストを実行
 * @param tracks - 分析対象の視聴履歴データ
 * @returns SWRのレスポンスオブジェクト
 */
export function usePersonaGeneration(tracks: PersonaTrackItem[] | undefined): UsePersonaGenerationReturn {
  const { data, error, isLoading, mutate } = useSWR(
    tracks && tracks.length > 0 ? ['/api/ai/persona', tracks] : null,
    personaAxiosFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (err: Error) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Persona generation failed:', err);
        }
      },
      shouldRetryOnError: true,
      errorRetryCount: 2,
      // リトライ間隔を設定（AI処理は時間がかかるため長めに）
      errorRetryInterval: 3000, // 3秒から開始
      // ペルソナ生成は重い処理なので、成功したらキャッシュを長時間保持
      dedupingInterval: 30 * 60 * 1000, // 30分
      // ペルソナは一度生成されたら変更されないので、stale-while-revalidateを無効化
      revalidateIfStale: false,
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
