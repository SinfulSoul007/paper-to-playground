'use client';

import { useState, useCallback } from 'react';
import { LessonData, SliderConfig, ComparisonConfig, AnimationConfig } from '@/lib/types';
import Sidebar from './Sidebar';
import SectionCard from './SectionCard';
import InteractiveSlider from './InteractiveSlider';
import InteractiveComparison from './InteractiveComparison';
import InteractiveAnimation from './InteractiveAnimation';
import ConceptMap from './ConceptMap';
import Quiz from './Quiz';
import RelatedPapers from './RelatedPapers';

interface LessonViewProps {
  lesson: LessonData;
  onGoHome: () => void;
}

export default function LessonView({ lesson, onGoHome }: LessonViewProps) {
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [showConceptMap, setShowConceptMap] = useState(false);

  const handleSectionVisible = useCallback((sectionId: string) => {
    setCompletedSections((prev) => {
      if (prev.has(sectionId)) return prev;
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Build a map of interactive elements keyed by afterSection
  const interactivesBySection = new Map<string, typeof lesson.interactiveElements>();
  for (const elem of lesson.interactiveElements) {
    const existing = interactivesBySection.get(elem.afterSection) || [];
    existing.push(elem);
    interactivesBySection.set(elem.afterSection, existing);
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        lesson={lesson}
        completedSections={completedSections}
        onSectionClick={scrollToSection}
        onOpenConceptMap={() => setShowConceptMap(true)}
        onGoHome={onGoHome}
      />

      {/* Main content */}
      <main className="lg:ml-[280px] min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
          {/* Paper header */}
          <div className="mb-12 pb-8 border-b border-border">
            <h1
              className="text-4xl md:text-5xl text-text-primary mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-instrument-serif)' }}
            >
              {lesson.paperTitle}
            </h1>
            <p className="text-text-secondary mb-6">{lesson.authors}</p>
            <div className="bg-accent/[0.06] border border-accent/15 rounded-xl p-5">
              <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">TL;DR</p>
              <p className="text-text-primary leading-relaxed">{lesson.tldr}</p>
            </div>
          </div>

          {/* Sections with interactive elements */}
          {lesson.sections.map((section, index) => (
            <div key={section.id}>
              <SectionCard
                section={section}
                index={index}
                onVisible={handleSectionVisible}
              />

              {/* Render interactive elements after this section */}
              {interactivesBySection.get(section.id)?.map((elem) => {
                switch (elem.type) {
                  case 'slider':
                    return (
                      <InteractiveSlider
                        key={elem.id}
                        title={elem.title}
                        description={elem.description}
                        config={elem.config as SliderConfig}
                      />
                    );
                  case 'comparison':
                    return (
                      <InteractiveComparison
                        key={elem.id}
                        title={elem.title}
                        description={elem.description}
                        config={elem.config as ComparisonConfig}
                      />
                    );
                  case 'animation':
                    return (
                      <InteractiveAnimation
                        key={elem.id}
                        title={elem.title}
                        description={elem.description}
                        config={elem.config as AnimationConfig}
                      />
                    );
                  default:
                    return null;
                }
              })}

              {/* Divider between sections */}
              {index < lesson.sections.length - 1 && (
                <div className="my-12 border-t border-border/50" />
              )}
            </div>
          ))}

          {/* Quiz */}
          {lesson.quiz && lesson.quiz.length > 0 && (
            <>
              <div className="my-12 border-t border-border" />
              <Quiz
                questions={lesson.quiz}
                onJumpToSection={scrollToSection}
              />
            </>
          )}

          {/* Related papers */}
          {lesson.relatedPapers && lesson.relatedPapers.length > 0 && (
            <>
              <div className="my-12 border-t border-border" />
              <RelatedPapers papers={lesson.relatedPapers} paperTitle={lesson.paperTitle} />
            </>
          )}
        </div>
      </main>

      {/* Concept map modal */}
      {showConceptMap && lesson.conceptMap && (
        <ConceptMap
          data={lesson.conceptMap}
          onClose={() => setShowConceptMap(false)}
        />
      )}
    </div>
  );
}
