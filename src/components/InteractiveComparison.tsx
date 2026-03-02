'use client';

import { ComparisonConfig } from '@/lib/types';
import { ArrowLeftRight } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface InteractiveComparisonProps {
  title: string;
  description: string;
  config: ComparisonConfig;
}

export default function InteractiveComparison({ title, description, config }: InteractiveComparisonProps) {
  return (
    <div className="my-8 bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-accent/[0.03]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <ArrowLeftRight className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
            <p className="text-xs text-text-secondary mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {/* Comparison panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Left panel */}
        <div className="p-6">
          <h4 className="text-sm font-semibold text-accent mb-4 uppercase tracking-wider">
            {config.leftLabel}
          </h4>
          <div className="text-sm text-text-secondary leading-relaxed">
            <MarkdownRenderer content={config.leftContent} />
          </div>
        </div>

        {/* Right panel */}
        <div className="p-6">
          <h4 className="text-sm font-semibold text-accent mb-4 uppercase tracking-wider">
            {config.rightLabel}
          </h4>
          <div className="text-sm text-text-secondary leading-relaxed">
            <MarkdownRenderer content={config.rightContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
