'use client';

import { useState, useEffect } from 'react';

const LOADING_STAGES = [
  'Reading paper...',
  'Extracting key concepts...',
  'Analyzing methodology...',
  'Building your lesson...',
  'Generating interactive elements...',
  'Creating knowledge graph...',
  'Preparing quiz questions...',
  'Almost there...',
];

export default function LoadingScreen() {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setStageIndex((prev) => (prev + 1) % LOADING_STAGES.length);
        setFade(true);
      }, 300);
    }, 2500);

    return () => clearInterval(stageInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.random() * 3 + 0.5;
        return Math.min(prev + increment, 90);
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-8">
        {/* Animated icon */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-accent/40 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-accent/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>

        {/* Stage text */}
        <div className="h-8 flex items-center justify-center">
          <p
            className={`text-lg text-text-secondary transition-opacity duration-300 ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {LOADING_STAGES[stageIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-muted rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-2 text-center">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Tip */}
        <p className="text-sm text-text-secondary/60 text-center">
          Generating a personalized lesson tailored to your background level...
        </p>
      </div>
    </div>
  );
}
