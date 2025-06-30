'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Music, Loader2 } from 'lucide-react';

export default function LoadingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [recentTracks, setRecentTracks] = useState<{
    tracks: any[];
    total: number;
    limit: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    'Connecting to Spotify...',
    'Fetching your listening history...',
    'Analyzing your music taste...',
    'Generating your AI persona...',
    'Preparing your summary...',
  ];

  // Spotify APIからデータを取得
  useEffect(() => {
    const fetchRecentTracks = async () => {
      if (!session) return;

      try {
        setCurrentStep(1); // "Fetching your listening history..."

        const response = await fetch('/api/recently-played');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRecentTracks(data);

        // データを sessionStorage に保存（summaryページで使用）
        sessionStorage.setItem('recentTracks', JSON.stringify(data));

      } catch (error) {
        console.error('Error fetching recent tracks:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    if (session) {
      fetchRecentTracks();
    }
  }, [session]);

  // プログレスバーのアニメーション
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push('/summary'), 500);
          return 100;
        }

        // データ取得完了後はプログレスを加速
        const increment = recentTracks ? 5 : 1;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [router, recentTracks]);

  // ステップ表示のアニメーション（データ取得中は自動、完了後は段階的に進む）
  useEffect(() => {
    if (!recentTracks) {
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 1) return 1; // データ取得中は "Fetching..." で止める
          return prev + 1;
        });
      }, 1500);

      return () => clearInterval(stepInterval);
    } else {
      // データ取得完了後は順次ステップを進める
      const progressSteps = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentStep(2); // "Analyzing your music taste..."

        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurrentStep(3); // "Generating your AI persona..."

        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurrentStep(4); // "Preparing your summary..."
      };

      progressSteps();
    }
  }, [recentTracks]);

  // 認証チェック
  useEffect(() => {
    if (!session) {
      router.push('/');
    }
  }, [session, router]);

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <div className="h-24 w-24 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <Music className="h-12 w-12 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-4 text-red-400">エラーが発生しました</h2>
            <p className="text-[#A1A1A1] text-sm mb-6">{error}</p>
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

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Animated Logo */}
        <div className="mb-12">
          <div className="relative">
            <div className="h-24 w-24 mx-auto rounded-full bg-linear-to-br from-[#1DB954] to-[#00FFC2] flex items-center justify-center animate-pulse">
              <Music className="h-12 w-12 text-black" />
            </div>
            <div className="absolute inset-0 h-24 w-24 mx-auto rounded-full bg-linear-to-br from-[#1DB954] to-[#00FFC2] animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
            <div
              className="bg-linear-to-r from-[#1DB954] to-[#00FFC2] h-3 rounded-full transition-all duration-300 ease-out shadow-[0_0_20px_rgba(29,185,84,0.5)]"
              style={{ width: `${progress}%` }}
            >
            </div>
          </div>
          <p className="text-[#A1A1A1] text-sm">{progress}% complete</p>
        </div>

        {/* Current Step */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-6 w-6 text-[#00FFC2] animate-spin mr-3" />
            <h2 className="text-xl font-semibold">{steps[currentStep]}</h2>
          </div>
          {/* デバッグ情報（開発時のみ） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-[#A1A1A1] mt-2">
              {recentTracks ? `取得済み: ${recentTracks.total}曲` : 'データ取得中...'}
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
            >
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
