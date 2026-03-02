'use client';

import { useState, useCallback } from 'react';
import { QuizQuestion } from '@/lib/types';
import { HelpCircle, ArrowRight, RotateCcw, ExternalLink } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface QuizProps {
  questions: QuizQuestion[];
  onJumpToSection: (sectionId: string) => void;
}

export default function Quiz({ questions, onJumpToSection }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSelect = useCallback((optionIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);
    if (optionIndex === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  }, [selectedAnswer, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
  }, [currentIndex, questions.length]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setIsFinished(false);
  }, []);

  const getScoreMessage = (score: number, total: number) => {
    const pct = score / total;
    if (pct === 1) return "Perfect score! You've mastered this paper.";
    if (pct >= 0.8) return "Excellent! You have a strong understanding of this paper.";
    if (pct >= 0.6) return "Good job! You've grasped the core concepts.";
    if (pct >= 0.4) return "Not bad! Review the sections you missed to strengthen your understanding.";
    return "Keep learning! Try re-reading the lesson and attempt the quiz again.";
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  if (isFinished) {
    return (
      <div className="my-12">
        <div className="bg-surface border border-border rounded-xl p-8 text-center max-w-lg mx-auto">
          <div className="mb-6">
            <div className="text-6xl mb-4" style={{ fontFamily: 'var(--font-instrument-serif)' }}>
              {score}/{questions.length}
            </div>
            <p className="text-text-secondary leading-relaxed">
              {getScoreMessage(score, questions.length)}
            </p>
          </div>

          {/* Score bar */}
          <div className="w-full h-3 bg-border rounded-full overflow-hidden mb-6">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                score / questions.length >= 0.6 ? 'bg-success' : 'bg-accent'
              }`}
              style={{ width: `${(score / questions.length) * 100}%` }}
            />
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 bg-accent text-background font-semibold rounded-lg px-6 py-3
              hover:bg-accent-muted transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-12">
      {/* Quiz header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/10">
          <HelpCircle className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2
            className="text-2xl text-text-primary"
            style={{ fontFamily: 'var(--font-instrument-serif)' }}
          >
            Test Your Understanding
          </h2>
          <p className="text-sm text-text-secondary">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-4">
        <div className="flex items-start gap-3 mb-1">
          <span className="text-xs font-semibold text-accent/70 uppercase tracking-wider px-2 py-0.5 rounded bg-accent/10">
            {currentQuestion.type}
          </span>
        </div>
        <div className="text-lg text-text-primary mt-3">
          <MarkdownRenderer content={currentQuestion.question} />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, i) => {
          let borderClass = 'border-border hover:border-accent/30 hover:bg-surface-hover';
          let bgClass = 'bg-surface';

          if (selectedAnswer !== null) {
            if (i === currentQuestion.correctIndex) {
              borderClass = 'border-success/50';
              bgClass = 'bg-success/[0.08]';
            } else if (i === selectedAnswer && i !== currentQuestion.correctIndex) {
              borderClass = 'border-error/50';
              bgClass = 'bg-error/[0.08]';
            } else {
              borderClass = 'border-border opacity-50';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selectedAnswer !== null}
              className={`w-full flex items-start gap-4 ${bgClass} border ${borderClass} rounded-xl p-4 text-left
                transition-all duration-200 disabled:cursor-default`}
            >
              <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold
                ${selectedAnswer !== null && i === currentQuestion.correctIndex
                  ? 'bg-success/20 text-success'
                  : selectedAnswer === i && i !== currentQuestion.correctIndex
                  ? 'bg-error/20 text-error'
                  : 'bg-background text-text-secondary border border-border'
                }`}
              >
                {optionLetters[i]}
              </span>
              <span className="text-sm text-text-primary leading-relaxed pt-1">
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="animate-fade-in-up">
          <div className={`rounded-xl p-5 mb-6 border ${
            selectedAnswer === currentQuestion.correctIndex
              ? 'bg-success/[0.05] border-success/20'
              : 'bg-error/[0.05] border-error/20'
          }`}>
            <p className={`text-sm font-semibold mb-2 ${
              selectedAnswer === currentQuestion.correctIndex ? 'text-success' : 'text-error'
            }`}>
              {selectedAnswer === currentQuestion.correctIndex ? 'Correct!' : 'Not quite right.'}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              {currentQuestion.explanation}
            </p>
            {currentQuestion.paperReference && (
              <button
                onClick={() => onJumpToSection(currentQuestion.paperReference)}
                className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-muted transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Jump to relevant section
              </button>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-accent text-background font-semibold rounded-lg px-6 py-3
                hover:bg-accent-muted transition-all"
            >
              {currentIndex >= questions.length - 1 ? 'See Results' : 'Next Question'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
