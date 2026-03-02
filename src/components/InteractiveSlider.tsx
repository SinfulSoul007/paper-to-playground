'use client';

import { useState, useMemo } from 'react';
import { SliderConfig } from '@/lib/types';
import { SlidersHorizontal } from 'lucide-react';

interface InteractiveSliderProps {
  title: string;
  description: string;
  config: SliderConfig;
}

export default function InteractiveSlider({ title, description, config }: InteractiveSliderProps) {
  const [value, setValue] = useState(config.default);

  const currentOutput = useMemo(() => {
    if (!config.dataPoints || config.dataPoints.length === 0) {
      return config.effectDescription;
    }

    // Find the closest data point
    const sorted = [...config.dataPoints].sort((a, b) => a.value - b.value);

    // Find exact match or closest
    const exact = sorted.find((dp) => dp.value === value);
    if (exact) return exact.output;

    // Find nearest data point
    let closest = sorted[0];
    let minDist = Math.abs(value - sorted[0].value);
    for (const dp of sorted) {
      const dist = Math.abs(value - dp.value);
      if (dist < minDist) {
        minDist = dist;
        closest = dp;
      }
    }
    return closest.output;
  }, [value, config.dataPoints, config.effectDescription]);

  const percentage = ((value - config.min) / (config.max - config.min)) * 100;

  return (
    <div className="my-8 bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-accent/[0.03]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <SlidersHorizontal className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
            <p className="text-xs text-text-secondary mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-secondary">{config.parameter}</span>
          <span className="text-sm font-semibold text-accent">
            {value}{config.unit ? ` ${config.unit}` : ''}
          </span>
        </div>

        {/* Custom slider */}
        <div className="relative">
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-muted rounded-full transition-all duration-150"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* Thumb indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full shadow-lg shadow-accent/30 pointer-events-none transition-all duration-150"
            style={{ left: `calc(${percentage}% - 8px)` }}
          />
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-xs text-text-secondary">{config.min}{config.unit ? ` ${config.unit}` : ''}</span>
          <span className="text-xs text-text-secondary">{config.max}{config.unit ? ` ${config.unit}` : ''}</span>
        </div>

        {/* Output display */}
        <div className="mt-5 p-4 bg-background rounded-lg border border-border">
          <p className="text-sm text-text-primary leading-relaxed transition-opacity duration-300">
            {currentOutput}
          </p>
        </div>
      </div>
    </div>
  );
}
