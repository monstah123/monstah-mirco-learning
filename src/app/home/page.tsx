'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TOPICS, getLessonsByTopic, LESSONS } from '@/lib/content';
import { getProgress, updateStreak, getCustomTopicPackages } from '@/lib/storage';
import { UserProgress, DEFAULT_PROGRESS } from '@/lib/types';
import AiTopicGenerator from '@/components/AiTopicGenerator';
import AiRoleplayModal from '@/components/AiRoleplayModal';

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [customPackages, setCustomPackages] = useState<ReturnType<typeof getCustomTopicPackages>>([]);
  const [showRoleplayModal, setShowRoleplayModal] = useState(false);

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

      {/* Daily Goal Card */}
      <div className="card daily-goal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.8rem' }}>🎯</span>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Daily Goal: 1 Lesson</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {completedCount > 0 ? "You're building momentum! Keep your streak alive." : "Complete 1 lesson today to hit your daily goal!"}
              </p>
            </div>
          </div>
          <span className={`progress-badge ${completedCount > 0 ? 'completed' : 'in-progress'}`}>
            {completedCount > 0 ? '✓ Daily Goal Met' : '0/1 Done'}
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className={`progress-bar-fill ${completedCount > 0 ? 'complete' : ''}`}
            style={{ width: `${completedCount > 0 ? 100 : 15}%` }}
          />
        </div>
      </div>

      {/* AI Generator Banner */}
      <AiTopicGenerator />

      {/* AI Roleplay Practice Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.15) 0%, rgba(230, 126, 34, 0.15) 100%)',
          borderColor: '#FF3366',
          padding: '20px 24px',
          margin: '24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: '2.4rem' }}>🤖</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Live AI Roleplay Practice</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Practice flirting, small talk, and salary negotiations with Gemini AI partner & get real-time Charisma ratings!
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowRoleplayModal(true)}
          style={{
            background: 'linear-gradient(135deg, #FF3366 0%, #E67E22 100%)',
            border: 'none',
            padding: '12px 24px',
            fontSize: '0.95rem',
            fontWeight: 800,
          }}
        >
          Start AI Roleplay →
        </button>
      </div>

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
              <div className="lesson-card-info" style={{ flex: 1 }}>
                <h3>{nextLesson.lesson.title}</h3>
                <p>{nextLesson.lesson.subtitle} • {nextLesson.topic.name}</p>
                <div style={{ marginTop: 8 }}>
                  <div className="progress-bar-container" style={{ height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
              <div className="lesson-card-meta">
                <span className="lesson-card-duration">
                  ⏱️ {nextLesson.lesson.duration} min
                </span>
                <span className="btn btn-primary btn-sm">Start →</span>
              </div>
              <div className="card-bottom-progress">
                <div className="card-bottom-progress-fill" style={{ width: '25%' }} />
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
          {allTopics.slice(0, 6).map(topic => {
            const completed = progress.topicProgress[topic.id] || 0;
            const total = topic.lessonCount;
            const pct = Math.round((completed / total) * 100);

            return (
              <Link href={`/topics/${topic.id}`} key={topic.id} style={{ textDecoration: 'none' }}>
                <div className="card card-clickable topic-card" style={{ '--topic-color': topic.color } as React.CSSProperties}>
                  <div>
                    <span className="topic-card-icon">{topic.icon}</span>
                    <h3>{topic.name}</h3>
                    <p>{topic.description}</p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
                      <span>Progress</span>
                      <span>{completed}/{total} ({pct}%)</span>
                    </div>
                    <div className="progress-bar-container" style={{ marginBottom: 12 }}>
                      <div className={`progress-bar-fill ${pct === 100 ? 'complete' : ''}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="topic-card-footer">
                      <span className="topic-card-count">{topic.lessonCount} lessons</span>
                      <span className="btn btn-sm btn-primary">Explore →</span>
                    </div>
                  </div>
                  <div className="card-bottom-progress">
                    <div className={`card-bottom-progress-fill ${pct === 100 ? 'completed' : ''}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* AI Roleplay Practice Modal */}
      {showRoleplayModal && (
        <AiRoleplayModal
          scenarioTitle="High-Status Social Banter & Practice"
          scenarioDescription="Practice flirting, small talk, or salary negotiations with live Gemini AI partner."
          onClose={() => setShowRoleplayModal(false)}
        />
      )}
    </div>
  );
}
