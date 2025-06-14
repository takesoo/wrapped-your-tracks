'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Loader2 } from 'lucide-react';

export default function LoadingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Connecting to Spotify...',
    'Fetching your listening history...',
    'Analyzing your music taste...',
    'Generating your AI persona...',
    'Preparing your summary...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push('/summary'), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1000);

    return () => clearInterval(stepInterval);
  }, [steps.length]);

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
