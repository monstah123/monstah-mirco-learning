'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { getTopicById, getLessonsByTopic } from '@/lib/content';
import { getProgress, getCustomTopicPackages } from '@/lib/storage';
import { UserProgress, DEFAULT_PROGRESS, Topic, Lesson } from '@/lib/types';

export default function TopicDetailPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [topic, setTopic] = useState<Topic | undefined>(undefined);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    setProgress(getProgress());

    let foundTopic = getTopicById(topicId);
    let foundLessons = getLessonsByTopic(topicId);

    if (!foundTopic || foundLessons.length === 0) {
      const customPkgs = getCustomTopicPackages();
      const customPkg = customPkgs.find(p => p.topic.id === topicId);
      if (customPkg) {
        foundTopic = customPkg.topic;
        foundLessons = [customPkg.lesson];
      }
    }

    setTopic(foundTopic);
    setLessons(foundLessons);
  }, [topicId]);

  if (!topic) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Topic not found</h3>
          <Link href="/topics" className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Topics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Link href="/topics" className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>
          ← Back to Topics
        </Link>
        <h1>{topic.icon} {topic.name}</h1>
        <p>{topic.description}</p>
      </div>

      <div className="lesson-list">
        {lessons.map((lesson, index) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);
          const cardCount = lesson.cards?.length || 4;
          const pct = isCompleted ? 100 : 0;

          return (
            <Link
              href={`/lesson/${topic.id}/${lesson.id}`}
              key={lesson.id}
              style={{ textDecoration: 'none' }}
            >
              <div className="card card-clickable lesson-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div
                  className="lesson-card-number"
                  style={{ background: topic.color }}
                >
                  {index + 1}
                </div>
                <div className="lesson-card-info" style={{ flex: 1 }}>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.subtitle}</p>
                  <div style={{ marginTop: 8 }}>
                    <div className="progress-bar-container" style={{ height: 6 }}>
                      <div
                        className={`progress-bar-fill ${isCompleted ? 'complete' : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="lesson-card-meta">
                  <span className="lesson-card-duration">
                    ⏱️ {lesson.duration} min
                  </span>
                  <span className={`progress-badge ${isCompleted ? 'completed' : ''}`}>
                    {isCompleted ? '✓ Done' : `${cardCount} Cards`}
                  </span>
                </div>
                <div className="card-bottom-progress">
                  <div
                    className={`card-bottom-progress-fill ${isCompleted ? 'completed' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
