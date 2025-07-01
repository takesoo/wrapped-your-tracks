import { useEffect, useMemo } from 'react';
import { debounce } from '@/lib/debounce';

interface UseSessionStorageParams {
  spotifyData?: unknown;
  persona?: unknown;
}

/**
 * sessionStorageへのデータ保存を管理するカスタムhook
 * デバウンス機能付きで、パフォーマンスを最適化
 * @param params - 保存対象のデータ
 */
export function useSessionStorage({ spotifyData, persona }: UseSessionStorageParams): void {
  // デバウンスされたsessionStorage保存関数
  const debouncedSave = useMemo(
    () => debounce((key: string, data: unknown) => {
      try {
        sessionStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error(`Failed to save ${key} to sessionStorage:`, error);
        }
      }
    }, 300),
    [],
  );

  // sessionStorageへの保存
  useEffect(() => {
    if (spotifyData) {
      debouncedSave('recentTracks', spotifyData);
    }
    if (persona) {
      debouncedSave('persona', persona);
    }
  }, [spotifyData, persona, debouncedSave]);
}
