'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TOPICS, getLessonsByTopic, LESSONS } from '@/lib/content';
import { getProgress, updateStreak, getCustomTopicPackages } from '@/lib/storage';
import { UserProgress, DEFAULT_PROGRESS } from '@/lib/types';
import AiTopicGenerator from '@/components/AiTopicGenerator';

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [customPackages, setCustomPackages] = useState<ReturnType<typeof getCustomTopicPackages>>([]);

  useEffect(() => {
    const p = updateStreak();
    setProgress(p);
    setCustomPackages(getCustomTopicPackages());
  }, []);

  // Merge static topics with custom AI-generated topics
  const allTopics = [
    ...customPackages.map(pkg => pkg.topic),
    ...TOPICS,
  ];

  // Find a recommended next lesson
  const getNextLesson = () => {
    for (const topic of allTopics) {
      const customPkg = customPackages.find(p => p.topic.id === topic.id);
      const lessons = customPkg ? [customPkg.lesson] : getLessonsByTopic(topic.id);
      for (const lesson of lessons) {
        if (!progress.completedLessons.includes(lesson.id)) {
          return { lesson, topic };
        }
      }
    }
    return null;
  };

  const nextLesson = getNextLesson();
  const totalLessons = LESSONS.length + customPackages.length;
  const completedCount = progress.completedLessons.length;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1>{getGreeting()}, Learner! 👋</h1>
          <p>
            {completedCount === 0
              ? "Welcome to Monstah! Start your micro-learning journey today."
              : `You've completed ${completedCount} of ${totalLessons} lessons. Keep going!`}
          </p>
          <div className="dashboard-stats">
            <div className="dashboard-stat">
              <span className="dashboard-stat-value">🔥 {progress.streak}</span>
              <span className="dashboard-stat-label">Day Streak</span>
            </div>
            <div className="dashboard-stat">
              <span className="dashboard-stat-value">⭐ {progress.odometer}</span>
              <span className="dashboard-stat-label">Total XP</span>
            </div>
            <div className="dashboard-stat">
              <span className="dashboard-stat-value">📚 {completedCount}</span>
              <span className="dashboard-stat-label">Lessons Done</span>
            </div>
            <div className="dashboard-stat">
              <span className="dashboard-stat-value">🏆 Lv.{progress.level}</span>
              <span className="dashboard-stat-label">Level</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generator Banner */}
      <AiTopicGenerator />

      {/* Continue Learning */}
      {nextLesson && (
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>📖 Featured Lesson</h2>
          </div>
          <Link
            href={`/lesson/${nextLesson.topic.id}/${nextLesson.lesson.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div className="card card-clickable lesson-card">
              <div
                className="lesson-card-number"
                style={{ background: nextLesson.topic.color }}
              >
                {nextLesson.topic.icon}
              </div>
              <div className="lesson-card-info">
                <h3>{nextLesson.lesson.title}</h3>
                <p>{nextLesson.lesson.subtitle} • {nextLesson.topic.name}</p>
              </div>
              <div className="lesson-card-meta">
                <span className="lesson-card-duration">
                  ⏱️ {nextLesson.lesson.duration} min
                </span>
                <span className="btn btn-primary btn-sm">Start →</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Explore Topics */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>🔍 Explore Topics ({allTopics.length})</h2>
          <Link href="/topics">See all →</Link>
        </div>
        <div className="topics-grid">
          {allTopics.slice(0, 6).map(topic => (
            <Link href={`/topics/${topic.id}`} key={topic.id} style={{ textDecoration: 'none' }}>
              <div className="card card-clickable topic-card" style={{ '--topic-color': topic.color } as React.CSSProperties}>
                <span className="topic-card-icon">{topic.icon}</span>
                <h3>{topic.name}</h3>
                <p>{topic.description}</p>
                <div className="topic-card-footer">
                  <span className="topic-card-count">{topic.lessonCount} lessons</span>
                  <span className="btn btn-sm btn-primary">Explore →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
