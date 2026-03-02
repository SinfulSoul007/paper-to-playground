export type BackgroundLevel = 'beginner' | 'undergrad' | 'grad' | 'expert';

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  keyTakeaway: string;
}

export interface ConceptNode {
  id: string;
  label: string;
  description: string;
  isPrerequisite: boolean;
  difficulty: number;
}

export interface ConceptEdge {
  source: string;
  target: string;
  label: string;
}

export interface ConceptMapData {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

export interface SliderConfig {
  parameter: string;
  min: number;
  max: number;
  default: number;
  step: number;
  unit: string;
  effectDescription: string;
  dataPoints: { value: number; output: string }[];
}

export interface ComparisonConfig {
  leftLabel: string;
  rightLabel: string;
  leftContent: string;
  rightContent: string;
}

export interface AnimationConfig {
  steps: { label: string; description: string }[];
}

export interface InteractiveElement {
  id: string;
  afterSection: string;
  type: 'slider' | 'comparison' | 'animation';
  title: string;
  description: string;
  config: SliderConfig | ComparisonConfig | AnimationConfig;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'conceptual' | 'application' | 'whatif';
  options: string[];
  correctIndex: number;
  explanation: string;
  paperReference: string;
}

export interface RelatedPaper {
  title: string;
  reason: string;
  arxivId: string;
}

export interface ExaPaper {
  title: string;
  url: string;
  summary: string;
  publishedDate: string | null;
  author: string | null;
}

export interface LessonData {
  paperTitle: string;
  authors: string;
  tldr: string;
  sections: LessonSection[];
  conceptMap: ConceptMapData;
  interactiveElements: InteractiveElement[];
  quiz: QuizQuestion[];
  relatedPapers: RelatedPaper[];
}

export interface AppState {
  paperText: string | null;
  paperTitle: string | null;
  level: BackgroundLevel | null;
  lesson: LessonData | null;
  isLoading: boolean;
  loadingStage: string;
  error: string | null;
  completedSections: Set<string>;
}
