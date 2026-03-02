'use client';

import { BackgroundLevel } from '@/lib/types';
import { BookOpen, GraduationCap, Microscope, Brain } from 'lucide-react';

interface LevelSelectProps {
  onSelect: (level: BackgroundLevel) => void;
}

const levels: {
  id: BackgroundLevel;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'beginner',
    title: 'Curious Beginner',
    description: 'I have no background in this field. Explain everything from scratch.',
    icon: <BookOpen className="w-8 h-8" />,
  },
  {
    id: 'undergrad',
    title: 'Undergrad Student',
    description: 'I know the basics of this field but not advanced topics.',
    icon: <GraduationCap className="w-8 h-8" />,
  },
  {
    id: 'grad',
    title: 'Grad / Adjacent Researcher',
    description: "I'm technical but not in this exact subfield.",
    icon: <Microscope className="w-8 h-8" />,
  },
  {
    id: 'expert',
    title: 'Expert (In-field)',
    description: 'I work in this area. Skip the basics, focus on novelty and nuance.',
    icon: <Brain className="w-8 h-8" />,
  },
];

export default function LevelSelect({ onSelect }: LevelSelectProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="max-w-3xl w-full px-6 animate-fade-in-up">
        <div className="text-center mb-10">
          <h2
            className="text-4xl font-normal mb-3 text-text-primary"
            style={{ fontFamily: 'var(--font-instrument-serif)' }}
          >
            What&apos;s your background?
          </h2>
          <p className="text-text-secondary text-lg">
            This helps us tailor the lesson to your level of expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className="group relative bg-surface border border-border rounded-xl p-6 text-left
                hover:bg-surface-hover hover:border-accent/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5
                transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="text-accent/70 group-hover:text-accent transition-colors duration-300">
                  {level.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {level.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {level.description}
                  </p>
                </div>
              </div>
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl bg-accent/0 group-hover:bg-accent/[0.02] transition-all duration-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
