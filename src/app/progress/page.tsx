'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TOPICS } from '@/lib/content';
import { getProgress, ACHIEVEMENT_DETAILS } from '@/lib/storage';
import { UserProgress, DEFAULT_PROGRESS } from '@/lib/types';

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const allAchievementKeys = Object.keys(ACHIEVEMENT_DETAILS);
  const totalQuizzes = Object.keys(progress.quizScores).length;
  const avgScore = totalQuizzes > 0
    ? Math.round(
        (Object.values(progress.quizScores).reduce((sum, q) => sum + (q.score / q.total) * 100, 0)) / totalQuizzes
      )
    : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Your Progress</h1>
        <p>Track your learning journey and achievements.</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-card-icon">⭐</div>
          <div className="stat-card-value">{progress.odometer}</div>
          <div className="stat-card-label">Total XP</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-icon">🔥</div>
          <div className="stat-card-value">{progress.streak}</div>
          <div className="stat-card-label">Current Streak</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-icon">📚</div>
          <div className="stat-card-value">{progress.completedLessons.length}</div>
          <div className="stat-card-label">Lessons Done</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-icon">🏆</div>
          <div className="stat-card-value">Lv.{progress.level}</div>
          <div className="stat-card-label">Level</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-icon">🎯</div>
          <div className="stat-card-value">{totalQuizzes}</div>
          <div className="stat-card-label">Quizzes Taken</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-icon">📊</div>
          <div className="stat-card-value">{avgScore}%</div>
          <div className="stat-card-label">Avg Quiz Score</div>
        </div>
      </div>

      {/* Topic Progress */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>📖 Topic Progress</h2>
        </div>
        <div className="lesson-list">
          {TOPICS.map(topic => {
            const completed = progress.topicProgress[topic.id] || 0;
            const total = topic.lessonCount;
            const pct = Math.round((completed / total) * 100);
            return (
              <Link href={`/topics/${topic.id}`} key={topic.id} style={{ textDecoration: 'none' }}>
                <div className="card card-clickable lesson-card">
                  <div
                    className="lesson-card-number"
                    style={{ background: topic.color }}
                  >
                    {topic.icon}
                  </div>
                  <div className="lesson-card-info" style={{ flex: 1 }}>
                    <h3>{topic.name}</h3>
                    <p>{completed}/{total} lessons completed</p>
                    <div className="progress-bar-container" style={{ marginTop: 8 }}>
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-600)', fontSize: '0.95rem' }}>
                    {pct}%
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>🏅 Achievements</h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
            {progress.achievements.length}/{allAchievementKeys.length} unlocked
          </span>
        </div>
        <div className="achievements-grid">
          {allAchievementKeys.map(key => {
            const detail = ACHIEVEMENT_DETAILS[key];
            const unlocked = progress.achievements.includes(key);
            
            // Calculate progress metric for each achievement
            const completed = progress.completedLessons.length;
            const streak = progress.streak;
            const xp = progress.odometer;
            const perfectCount = Object.values(progress.quizScores).filter(q => q.score === q.total).length;
            
            let current = 0;
            let target = 1;
            if (key === 'first_lesson') { current = Math.min(completed, 1); target = 1; }
            else if (key === 'five_lessons') { current = Math.min(completed, 5); target = 5; }
            else if (key === 'ten_lessons') { current = Math.min(completed, 10); target = 10; }
            else if (key === 'three_day_streak') { current = Math.min(streak, 3); target = 3; }
            else if (key === 'week_streak') { current = Math.min(streak, 7); target = 7; }
            else if (key === 'xp_500') { current = Math.min(xp, 500); target = 500; }
            else if (key === 'xp_1000') { current = Math.min(xp, 1000); target = 1000; }
            else if (key === 'perfect_quiz') { current = Math.min(perfectCount, 1); target = 1; }
            else if (key === 'five_perfect') { current = Math.min(perfectCount, 5); target = 5; }

            const pct = unlocked ? 100 : Math.round((current / target) * 100);

            return (
              <div className={`card achievement-card ${unlocked ? '' : 'locked'}`} key={key} style={{ position: 'relative', overflow: 'hidden' }}>
                <span className="achievement-icon">{detail.icon}</span>
                <div className="achievement-info" style={{ flex: 1 }}>
                  <h4>{detail.name}</h4>
                  <p>{detail.description}</p>
                  <div style={{ marginTop: 8 }}>
                    <div className="progress-bar-container" style={{ height: 6 }}>
                      <div
                        className={`progress-bar-fill ${unlocked ? 'complete' : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4, fontWeight: 700 }}>
                      {unlocked ? '✓ Unlocked' : `${current}/${target} (${pct}%)`}
                    </div>
                  </div>
                </div>
                <div className="card-bottom-progress">
                  <div
                    className={`card-bottom-progress-fill ${unlocked ? 'completed' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state for new users */}
      {progress.completedLessons.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🚀</div>
          <h3>Start learning to track your progress!</h3>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 20 }}>
            Complete lessons and quizzes to earn XP and unlock achievements.
          </p>
          <Link href="/topics" className="btn btn-primary">
            Explore Topics →
          </Link>
        </div>
      )}
    </div>
  );
}
