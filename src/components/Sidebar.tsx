'use client';

import { useState } from 'react';
import { LessonData } from '@/lib/types';
import { ArrowLeft, Check, Map, Menu, X } from 'lucide-react';

interface SidebarProps {
  lesson: LessonData;
  completedSections: Set<string>;
  onSectionClick: (sectionId: string) => void;
  onOpenConceptMap: () => void;
  onGoHome: () => void;
}

export default function Sidebar({
  lesson,
  completedSections,
  onSectionClick,
  onOpenConceptMap,
  onGoHome,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <>
      {/* Back to home */}
      <button
        onClick={() => {
          onGoHome();
          setMobileOpen(false);
        }}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent mb-5 transition-colors duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
        New Paper
      </button>

      {/* Paper info */}
      <div className="mb-6 pb-6 border-b border-border">
        <h2
          className="text-lg font-normal text-text-primary leading-snug mb-2"
          style={{ fontFamily: 'var(--font-instrument-serif)' }}
        >
          {lesson.paperTitle}
        </h2>
        <p className="text-xs text-text-secondary line-clamp-2">
          {lesson.authors}
        </p>
      </div>

      {/* TLDR */}
      <div className="mb-6 pb-6 border-b border-border">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">TL;DR</p>
        <p className="text-sm text-text-secondary leading-relaxed">
          {lesson.tldr}
        </p>
      </div>

      {/* Sections nav */}
      <nav className="flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Sections</p>
        <ul className="space-y-1">
          {lesson.sections.map((section, index) => {
            const isCompleted = completedSections.has(section.id);
            return (
              <li key={section.id}>
                <button
                  onClick={() => {
                    onSectionClick(section.id);
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left
                    hover:bg-surface-hover transition-colors duration-200 group"
                >
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition-colors duration-200
                    ${isCompleted
                      ? 'bg-success/20 border-success text-success'
                      : 'border-border group-hover:border-accent/50'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span className="text-xs text-text-secondary">{index + 1}</span>
                    )}
                  </span>
                  <span className={`text-sm leading-snug transition-colors duration-200 ${
                    isCompleted ? 'text-text-secondary' : 'text-text-primary group-hover:text-accent'
                  }`}>
                    {section.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Concept Map button */}
      <div className="mt-6 pt-6 border-t border-border">
        <button
          onClick={() => {
            onOpenConceptMap();
            setMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 bg-accent/10 border border-accent/20 text-accent
            rounded-lg px-4 py-3 hover:bg-accent/20 transition-all duration-200 text-sm font-medium"
        >
          <Map className="w-4 h-4" />
          View Concept Map
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-surface border border-border text-text-primary
          hover:bg-surface-hover transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-background border-r border-border p-6 flex flex-col overflow-y-auto">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {content}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[280px] bg-background border-r border-border p-6 overflow-y-auto">
        {content}
      </aside>
    </>
  );
}
