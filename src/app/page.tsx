'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { BackgroundLevel, LessonData } from '@/lib/types';
import { parsePdfFromFile, parsePdfFromUrl, generateLesson } from '@/lib/api';
import LandingPage from '@/components/LandingPage';
import LevelSelect from '@/components/LevelSelect';
import LoadingScreen from '@/components/LoadingScreen';
import LessonView from '@/components/LessonView';

type AppStep = 'landing' | 'level-select' | 'loading' | 'lesson';

export default function Home() {
  const [step, setStep] = useState<AppStep>('landing');
  const [paperText, setPaperText] = useState<string | null>(null);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const hasAutoLoaded = useRef(false);

  // Auto-load paper from ?url= query param (used by related paper links)
  useEffect(() => {
    if (hasAutoLoaded.current) return;
    const params = new URLSearchParams(window.location.search);
    const paperUrl = params.get('url');
    if (paperUrl) {
      hasAutoLoaded.current = true;
      // Clean the URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
      // Auto-submit the paper URL
      (async () => {
        try {
          setIsParsing(true);
          setError(null);
          const result = await parsePdfFromUrl(paperUrl);
          setPaperText(result.text);
          setStep('level-select');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch paper');
        } finally {
          setIsParsing(false);
        }
      })();
    }
  }, []);

  const handlePdfUpload = useCallback(async (file: File) => {
    try {
      setIsParsing(true);
      setError(null);
      const result = await parsePdfFromFile(file);
      setPaperText(result.text);
      setStep('level-select');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse PDF');
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleArxivSubmit = useCallback(async (url: string) => {
    try {
      setIsParsing(true);
      setError(null);
      const result = await parsePdfFromUrl(url);
      setPaperText(result.text);
      setStep('level-select');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch paper');
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleGoHome = useCallback(() => {
    setStep('landing');
    setPaperText(null);
    setLesson(null);
    setError(null);
  }, []);

  const handleLevelSelect = useCallback(async (level: BackgroundLevel) => {
    if (!paperText) return;
    try {
      setStep('loading');
      setError(null);
      const lessonData = await generateLesson(paperText, level);
      setLesson(lessonData);
      setStep('lesson');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate lesson');
      setStep('level-select');
    }
  }, [paperText]);

  // Error toast
  const errorToast = error ? (
    <div className="fixed top-4 right-4 z-[60] max-w-sm animate-fade-in-up">
      <div className="bg-error/10 border border-error/30 rounded-xl p-4 flex items-start gap-3">
        <p className="text-sm text-error flex-1">{error}</p>
        <button
          onClick={() => setError(null)}
          className="text-error/60 hover:text-error text-sm font-bold"
        >
          ×
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      {errorToast}

      {step === 'landing' && (
        <LandingPage
          onPdfUpload={handlePdfUpload}
          onArxivSubmit={handleArxivSubmit}
          isLoading={isParsing}
        />
      )}

      {step === 'level-select' && (
        <>
          <LandingPage
            onPdfUpload={handlePdfUpload}
            onArxivSubmit={handleArxivSubmit}
            isLoading={false}
          />
          <LevelSelect onSelect={handleLevelSelect} />
        </>
      )}

      {step === 'loading' && <LoadingScreen />}

      {step === 'lesson' && lesson && paperText && (
        <LessonView lesson={lesson} paperText={paperText} onGoHome={handleGoHome} />
      )}
    </>
  );
}
