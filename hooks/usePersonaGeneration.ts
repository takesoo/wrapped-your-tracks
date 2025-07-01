import useSWR from 'swr';
import type { PersonaTrackItem } from '@/lib/spotify-types';

// ペルソナ生成用のフェッチャー（データ変換不要）
const personaFetcher = async ([url, tracks]: [string, PersonaTrackItem[]]) => {
  if (!tracks || tracks.length === 0) return null;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recentTracks: tracks }),
  });

  if (!res.ok) throw new Error(`Persona API error! status: ${res.status}`);
  return res.json();
};

interface PersonaData {
  persona: string;
  insights: {
    tracksAnalyzed: number;
    uniqueArtists: number;
    uniqueAlbums: number;
    timeDistribution: {
      morning: number;
      afternoon: number;
      evening: number;
      night: number;
    };
    repeatTracks: number;
    diversityScore: number;
  };
}

interface UsePersonaGenerationReturn {
  data: PersonaData | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}

/**
 * AIペルソナを生成するカスタムhook
 * @param tracks - 分析対象の視聴履歴データ
 * @returns SWRのレスポンスオブジェクト
 */
export function usePersonaGeneration(tracks: PersonaTrackItem[] | undefined): UsePersonaGenerationReturn {
  const { data, error, isLoading, mutate } = useSWR(
    tracks && tracks.length > 0 ? ['/api/ai/persona', tracks] : null,
    personaFetcher,
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
