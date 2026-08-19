// ============================================
// Monstah Micro Learning — Supabase Cloud Sync
// Syncs XP, streaks, levels, completed lessons, and AI topics
// ============================================
import { createClient } from './supabase/client';
import { UserProgress, Topic, Lesson, Quiz } from './types';
import { getProgress, saveProgress, getCustomTopicPackages, saveCustomTopicPackage, CustomTopicPackage } from './storage';

const supabase = createClient();

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function syncUserProgressToCloud(progress: UserProgress): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return; // User not logged in, relies on localStorage

  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        id: user.id,
        streak: progress.streak,
        longest_streak: progress.longestStreak,
        odometer: progress.odometer,
        level: progress.level,
        last_active_date: progress.lastActiveDate,
        completed_lessons: progress.completedLessons,
        topic_progress: progress.topicProgress,
        quiz_scores: progress.quizScores,
        achievements: progress.achievements,
        updated_at: new Date().toISOString(),
      });

    if (error) console.error('Cloud progress sync error:', error);
  } catch (err) {
    console.error('Failed to sync progress to cloud:', err);
  }
}

export async function fetchUserProgressFromCloud(): Promise<UserProgress | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;

    const cloudProgress: UserProgress = {
      streak: data.streak || 0,
      longestStreak: data.longest_streak || 0,
      odometer: data.odometer || 0,
      level: data.level || 1,
      lastActiveDate: data.last_active_date || new Date().toISOString().split('T')[0],
      completedLessons: data.completed_lessons || [],
      topicProgress: data.topic_progress || {},
      quizScores: data.quiz_scores || {},
      achievements: data.achievements || [],
    };

    // Save to local storage cache
    saveProgress(cloudProgress);
    return cloudProgress;
  } catch (err) {
    console.error('Failed to fetch user progress from cloud:', err);
    return null;
  }
}

export async function syncCustomTopicToCloud(pkg: CustomTopicPackage): Promise<void> {
  const user = await getCurrentUser();
  saveCustomTopicPackage(pkg); // Always save locally first

  if (!user) return;

  try {
    const { error } = await supabase
      .from('user_custom_topics')
      .insert({
        user_id: user.id,
        topic_id: pkg.topic.id,
        topic_data: pkg.topic,
        lesson_data: pkg.lesson,
        quiz_data: pkg.quiz,
      });

    if (error) console.error('Cloud custom topic sync error:', error);
  } catch (err) {
    console.error('Failed to sync custom topic to cloud:', err);
  }
}

export async function fetchUserCustomTopicsFromCloud(): Promise<CustomTopicPackage[]> {
  const user = await getCurrentUser();
  if (!user) return getCustomTopicPackages();

  try {
    const { data, error } = await supabase
      .from('user_custom_topics')
      .select('*')
      .eq('user_id', user.id);

    if (error || !data) return getCustomTopicPackages();

    const cloudPackages: CustomTopicPackage[] = data.map(item => ({
      topic: item.topic_data as Topic,
      lesson: item.lesson_data as Lesson,
      quiz: item.quiz_data as Quiz,
    }));

    // Cache locally
    cloudPackages.forEach(pkg => saveCustomTopicPackage(pkg));
    return cloudPackages;
  } catch {
    return getCustomTopicPackages();
  }
}
