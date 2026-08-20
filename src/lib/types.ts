// ============================================
// Monstah Micro Learning — Type Definitions
// ============================================

export interface Topic {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  lessonCount: number;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  subtitle: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cards: LessonCard[];
  order: number;
}

export interface LessonCardExample {
  text: string;
  label?: string; // e.g. "Weak Phrasing", "Winning Script"
  status?: 'bad' | 'good' | 'best';
}

export interface LessonCard {
  id: string;
  type: 'scenario' | 'dialogue' | 'script' | 'fact' | 'explanation' | 'didYouKnow' | 'keyPoint' | 'visual';
  title: string;
  content: string;
  emoji?: string;
  highlight?: string;
  contextHeader?: string; // e.g., "📋 Intro", "🎬 Scenario", "💬 What to Say"
  examples?: LessonCardExample[];
}

export interface Quiz {
  id: string;
  lessonId: string;
  topicId: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserProgress {
  odometer: number; // total XP
  streak: number;
  lastActiveDate: string; // ISO date string
  longestStreak: number;
  completedLessons: string[]; // lesson IDs
  quizScores: Record<string, QuizScore>; // quizId -> score
  topicProgress: Record<string, number>; // topicId -> lessons completed
  achievements: string[];
  level: number;
}

export interface QuizScore {
  score: number;
  total: number;
  date: string;
}

export const DEFAULT_PROGRESS: UserProgress = {
  odometer: 0,
  streak: 0,
  lastActiveDate: '',
  longestStreak: 0,
  completedLessons: [],
  quizScores: {},
  topicProgress: {},
  achievements: [],
  level: 1,
};
