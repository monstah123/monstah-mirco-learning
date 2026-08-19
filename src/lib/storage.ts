// ============================================
// Monstah Micro Learning — Local Storage Service
// ============================================
import { UserProgress, DEFAULT_PROGRESS, QuizScore, Topic, Lesson, Quiz } from './types';

const STORAGE_KEY = 'monstah_progress';
const CUSTOM_TOPICS_KEY = 'monstah_custom_topics';

export interface CustomTopicPackage {
  topic: Topic;
  lesson: Lesson;
  quiz: Quiz;
}

export function getCustomTopicPackages(): CustomTopicPackage[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CUSTOM_TOPICS_KEY);
    if (!data) return [];
    return JSON.parse(data) as CustomTopicPackage[];
  } catch {
    return [];
  }
}

export function saveCustomTopicPackage(pkg: CustomTopicPackage): void {
  if (typeof window === 'undefined') return;
  const packages = getCustomTopicPackages();
  // Filter out duplicate if same ID
  const filtered = packages.filter(p => p.topic.id !== pkg.topic.id);
  filtered.unshift(pkg); // Add to beginning
  localStorage.setItem(CUSTOM_TOPICS_KEY, JSON.stringify(filtered));
}

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_PROGRESS;
    return JSON.parse(data) as UserProgress;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateStreak(): UserProgress {
  const progress = getProgress();
  const today = new Date().toISOString().split('T')[0];
  const lastActive = progress.lastActiveDate;

  if (lastActive === today) {
    return progress; // Already active today
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastActive === yesterdayStr) {
    // Continue streak
    progress.streak += 1;
  } else if (lastActive !== today) {
    // Streak broken
    progress.streak = 1;
  }

  progress.lastActiveDate = today;
  if (progress.streak > progress.longestStreak) {
    progress.longestStreak = progress.streak;
  }
  saveProgress(progress);
  return progress;
}

export function completeLesson(lessonId: string, topicId: string): UserProgress {
  const progress = getProgress();
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    progress.odometer += 50; // 50 XP per lesson
    progress.topicProgress[topicId] = (progress.topicProgress[topicId] || 0) + 1;
    
    // Level up every 200 XP
    progress.level = Math.floor(progress.odometer / 200) + 1;
    
    // Check achievements
    checkAchievements(progress);
  }
  progress.lastActiveDate = new Date().toISOString().split('T')[0];
  saveProgress(progress);
  return progress;
}

export function saveQuizScore(quizId: string, score: number, total: number): UserProgress {
  const progress = getProgress();
  const quizScore: QuizScore = {
    score,
    total,
    date: new Date().toISOString(),
  };
  progress.quizScores[quizId] = quizScore;
  
  // XP based on performance
  const percentage = score / total;
  if (percentage === 1) {
    progress.odometer += 100; // Perfect score bonus
  } else if (percentage >= 0.7) {
    progress.odometer += 50;
  } else {
    progress.odometer += 25;
  }
  
  progress.level = Math.floor(progress.odometer / 200) + 1;
  checkAchievements(progress);
  saveProgress(progress);
  return progress;
}

function checkAchievements(progress: UserProgress): void {
  const achievements = progress.achievements;
  
  if (progress.completedLessons.length >= 1 && !achievements.includes('first_lesson')) {
    achievements.push('first_lesson');
  }
  if (progress.completedLessons.length >= 5 && !achievements.includes('five_lessons')) {
    achievements.push('five_lessons');
  }
  if (progress.completedLessons.length >= 10 && !achievements.includes('ten_lessons')) {
    achievements.push('ten_lessons');
  }
  if (progress.streak >= 3 && !achievements.includes('three_day_streak')) {
    achievements.push('three_day_streak');
  }
  if (progress.streak >= 7 && !achievements.includes('week_streak')) {
    achievements.push('week_streak');
  }
  if (progress.odometer >= 500 && !achievements.includes('xp_500')) {
    achievements.push('xp_500');
  }
  if (progress.odometer >= 1000 && !achievements.includes('xp_1000')) {
    achievements.push('xp_1000');
  }
  
  // Perfect quiz score
  const perfectQuizzes = Object.values(progress.quizScores).filter(q => q.score === q.total);
  if (perfectQuizzes.length >= 1 && !achievements.includes('perfect_quiz')) {
    achievements.push('perfect_quiz');
  }
  if (perfectQuizzes.length >= 5 && !achievements.includes('five_perfect')) {
    achievements.push('five_perfect');
  }
}

export const ACHIEVEMENT_DETAILS: Record<string, { name: string; icon: string; description: string }> = {
  first_lesson: { name: 'First Steps', icon: '🎓', description: 'Complete your first lesson' },
  five_lessons: { name: 'Curious Mind', icon: '📚', description: 'Complete 5 lessons' },
  ten_lessons: { name: 'Knowledge Seeker', icon: '🧠', description: 'Complete 10 lessons' },
  three_day_streak: { name: 'On a Roll', icon: '🔥', description: '3-day learning streak' },
  week_streak: { name: 'Unstoppable', icon: '⚡', description: '7-day learning streak' },
  xp_500: { name: 'Rising Star', icon: '⭐', description: 'Earn 500 XP' },
  xp_1000: { name: 'Superstar', icon: '🌟', description: 'Earn 1000 XP' },
  perfect_quiz: { name: 'Perfectionist', icon: '💯', description: 'Get a perfect quiz score' },
  five_perfect: { name: 'Quiz Master', icon: '👑', description: 'Get 5 perfect quiz scores' },
};
