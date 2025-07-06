import { useEffect } from 'react';

interface UseSessionStorageParams {
  spotifyData?: unknown;
  persona?: unknown;
}

/**
 * sessionStorageへのデータ保存を管理するカスタムhook
 * @param params - 保存対象のデータ
 */
export function useSessionStorage({ spotifyData, persona }: UseSessionStorageParams): void {
  // sessionStorageへの保存
  useEffect(() => {
    if (spotifyData) {
      sessionStorage.setItem('recentTracks', JSON.stringify(spotifyData));
    }
    if (persona) {
      sessionStorage.setItem('persona', JSON.stringify(persona));
    }
  }, [spotifyData, persona]);
}
