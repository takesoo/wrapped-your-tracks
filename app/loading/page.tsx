'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Music, Loader2 } from 'lucide-react';
import {
  useSpotifyData,
  usePersonaGeneration,
  useLoadingProgress,
  useSessionStorage,
} from '@/hooks';

export default function LoadingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // カスタムhooksでデータ取得
  const {
    data: spotifyData,
    error: tracksError,
  } = useSpotifyData(!!session);

  const {
    data: persona,
    error: personaError,
  } = usePersonaGeneration(spotifyData?.personaTracks);

  // プログレス管理
  const {
    progress,
    currentStep,
    stepLabel,
    loadingState,
  } = useLoadingProgress({
    hasSession: !!session,
    hasSpotifyData: !!spotifyData,
    hasPersona: !!persona,
  });

  // sessionStorage管理
  useSessionStorage({
    spotifyData,
    persona,
  });

  // 完了時のリダイレクト
  useEffect(() => {
    if (progress >= 100) {
      const redirectTimer = setTimeout(() => {
        router.push('/summary');
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [progress, router]);

  // 認証とトークン期限チェック
  const checkAuthAndToken = useCallback(async () => {
    if (!session) {
      // セッションがない場合は認証開始
      await signIn('spotify', { callbackUrl: '/loading' });
      return;
    }

    // トークンの有効期限をチェック（expiresAtはUNIXタイムスタンプ（秒））
    if (session.expiresAt) {
      const expiresAtMs = Number(session.expiresAt) * 1000;
      const now = Date.now();
      const fiveMinutesMs = 5 * 60 * 1000;

      // 期限切れまたは期限が5分以内の場合は再認証
      if (expiresAtMs <= now + fiveMinutesMs) {
        await signIn('spotify', { callbackUrl: '/loading' });
      }
    }
  }, [session]);

  // 認証チェックの実行
  useEffect(() => {
    checkAuthAndToken();
  }, [checkAuthAndToken]);

  // エラー表示
  const error = tracksError || (personaError && !persona);
  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <div className="h-24 w-24 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <Music className="h-12 w-12 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-red-400">エラーが発生しました</h2>
            <p className="text-[#A1A1A1] text-sm mb-6">
              {tracksError ? 'Spotifyデータの取得に失敗しました' : 'ペルソナの生成に失敗しました'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#1DB954] text-black font-semibold rounded-full hover:bg-[#1DB954]/90 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = [
    'Connecting to Spotify...',
    'Fetching your listening history...',
    'Analyzing your music taste...',
    'Generating your AI persona...',
    'Preparing your summary...',
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Animated Logo */}
        <div className="mb-12">
          <div className="relative">
            <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-[#1DB954] to-[#00FFC2] flex items-center justify-center animate-pulse">
              <Music className="h-12 w-12 text-black" />
            </div>
            <div className="absolute inset-0 h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-[#1DB954] to-[#00FFC2] animate-ping opacity-20" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-[#1DB954] to-[#00FFC2] h-3 rounded-full transition-all duration-500 ease-out shadow-[0_0_20px_rgba(29,185,84,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[#A1A1A1] text-sm">{progress}% complete</p>
        </div>

        {/* Current Step */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-6 w-6 text-[#00FFC2] animate-spin mr-3" />
            <h2 className="text-xl font-semibold">{stepLabels[currentStep]}</h2>
          </div>

          {/* デバッグ情報（開発時のみ） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-[#A1A1A1] mt-2 space-y-1">
              <div>State: {loadingState}</div>
              {spotifyData && <div>取得済み: {spotifyData.total}曲</div>}
              {persona && <div>ペルソナ生成済み</div>}
              <div>Progress: {progress}%</div>
              <div>Step: {stepLabel}</div>
            </div>
          )}
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-[#33BBFF] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
