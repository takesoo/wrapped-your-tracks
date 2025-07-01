import { useMemo } from 'react';
import type { LoadingState, LoadingStep } from '@/lib/spotify-types';

interface LoadingProgressData {
  progress: number;
  currentStep: number;
  stepLabel: string;
  loadingState: LoadingState;
}

interface UseLoadingProgressParams {
  hasSession: boolean;
  hasSpotifyData: boolean;
  hasPersona: boolean;
}

/**
 * ローディング状態とプログレスを管理するカスタムhook
 * @param params - 各ステップの完了状態
 * @returns プログレス情報とローディング状態
 */
export function useLoadingProgress({
  hasSession,
  hasSpotifyData,
  hasPersona,
}: UseLoadingProgressParams): LoadingProgressData {
  // ローディング状態の管理
  const loadingState: LoadingState = useMemo(() => {
    if (!hasSession) return 'connecting';
    if (!hasSpotifyData) return 'fetching';
    if (!hasPersona) return 'generating';
    return 'complete';
  }, [hasSession, hasSpotifyData, hasPersona]);

  // プログレス計算
  const { progress, currentStep, stepLabel } = useMemo(() => {
    const steps: LoadingStep[] = [
      { key: 'session', weight: 20, done: hasSession, label: 'Connecting to Spotify...' },
      { key: 'tracks', weight: 40, done: hasSpotifyData, label: 'Fetching your listening history...' },
      { key: 'analyzing', weight: 20, done: hasSpotifyData, label: 'Analyzing your music taste...' },
      { key: 'persona', weight: 20, done: hasPersona, label: 'Generating your AI persona...' },
    ];

    const completedWeight = steps.reduce((acc, step) =>
      acc + (step.done ? step.weight : 0), 0,
    );

    const currentStepIndex = steps.findIndex(step => !step.done);
    const activeStep = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;

    return {
      progress: completedWeight,
      currentStep: activeStep,
      stepLabel: steps[activeStep]?.label || 'Preparing your summary...',
    };
  }, [hasSession, hasSpotifyData, hasPersona]);

  return {
    progress,
    currentStep,
    stepLabel,
    loadingState,
  };
}
