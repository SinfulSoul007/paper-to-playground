'use client';

import { useEffect, useRef } from 'react';
import { LessonSection } from '@/lib/types';
import { Lightbulb } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface SectionCardProps {
  section: LessonSection;
  index: number;
  onVisible: (sectionId: string) => void;
}

export default function SectionCard({ section, index, onVisible }: SectionCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible(section.id);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [section.id, onVisible]);

  return (
    <div
      ref={ref}
      id={section.id}
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="mb-8">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-sm font-semibold">
            {index + 1}
          </span>
          <h2
            className="text-2xl md:text-3xl text-text-primary"
            style={{ fontFamily: 'var(--font-instrument-serif)' }}
          >
            {section.title}
          </h2>
        </div>

        {/* Section content */}
        <div className="text-text-secondary leading-relaxed">
          <MarkdownRenderer content={section.content} />
        </div>

        {/* Key takeaway */}
        <div className="mt-8 bg-accent/[0.06] border border-accent/15 rounded-xl p-5 flex gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1.5">Key Takeaway</p>
            <p className="text-sm text-text-primary leading-relaxed">{section.keyTakeaway}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
