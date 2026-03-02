'use client';

import { useState } from 'react';
import { AnimationConfig } from '@/lib/types';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface InteractiveAnimationProps {
  title: string;
  description: string;
  config: AnimationConfig;
}

export default function InteractiveAnimation({ title, description, config }: InteractiveAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = config.steps || [];
  const total = steps.length;

  if (total === 0) return null;

  return (
    <div className="my-8 bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-accent/[0.03]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Play className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
            <p className="text-xs text-text-secondary mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="px-6 py-6">
        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentStep
                  ? 'w-8 h-2 bg-accent'
                  : i < currentStep
                  ? 'w-2 h-2 bg-accent/40'
                  : 'w-2 h-2 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Current step */}
        <div className="min-h-[120px] flex flex-col items-center justify-center text-center">
          <div className="mb-3">
            <span className="inline-block px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
              Step {currentStep + 1}: {steps[currentStep].label}
            </span>
          </div>
          <p className="text-text-primary leading-relaxed max-w-lg transition-opacity duration-300">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border text-sm text-text-secondary
              hover:text-text-primary hover:border-accent/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-xs text-text-secondary">
            {currentStep + 1} / {total}
          </span>

          <button
            onClick={() => setCurrentStep((prev) => Math.min(total - 1, prev + 1))}
            disabled={currentStep === total - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border text-sm text-text-secondary
              hover:text-text-primary hover:border-accent/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
