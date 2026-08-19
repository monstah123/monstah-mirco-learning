'use client';

import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { getLessonById, getTopicById } from '@/lib/content';
import { completeLesson, getProgress, getCustomTopicPackages } from '@/lib/storage';
import { syncUserProgressToCloud } from '@/lib/cloudStorage';
import { Lesson, Topic } from '@/lib/types';
import AudioPlayer from '@/components/AudioPlayer';

export default function LessonPage({ params }: { params: Promise<{ topicId: string; lessonId: string }> }) {
  const { topicId, lessonId } = use(params);
  const [currentCard, setCurrentCard] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [lesson, setLesson] = useState<Lesson | undefined>(undefined);
  const [topic, setTopic] = useState<Topic | undefined>(undefined);

  useEffect(() => {
    let foundLesson = getLessonById(lessonId);
    let foundTopic = getTopicById(topicId);

    if (!foundLesson || !foundTopic) {
      const customPackages = getCustomTopicPackages();
      const customPkg = customPackages.find(p => p.lesson.id === lessonId || p.topic.id === topicId);
      if (customPkg) {
        foundLesson = customPkg.lesson;
        foundTopic = customPkg.topic;
      }
    }

    setLesson(foundLesson);
    setTopic(foundTopic);

    const progress = getProgress();
    if (foundLesson && progress.completedLessons.includes(foundLesson.id)) {
      setCompleted(true);
    }
  }, [topicId, lessonId]);

  if (!lesson || !topic) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Lesson not found</h3>
          <Link href="/topics" className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Topics
          </Link>
        </div>
      </div>
    );
  }

  const cards = lesson.cards;
  const isLastCard = currentCard === cards.length - 1;
  const card = cards[currentCard];
  const progressPct = ((currentCard + 1) / cards.length) * 100;

  const handleComplete = async () => {
    const updatedProgress = completeLesson(lesson.id, topicId);
    setCompleted(true);
    await syncUserProgressToCloud(updatedProgress);
  };

  const handleNext = () => {
    if (isLastCard) {
      handleComplete();
    } else {
      setCurrentCard(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard(prev => prev - 1);
    }
  };

  // Highlight text in content
  const renderContent = (text: string, highlight?: string) => {
    if (!highlight) return text;
    const parts = text.split(highlight);
    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && <span className="highlight">{highlight}</span>}
      </span>
    ));
  };

  return (
    <div className="page-container">
      <div className="lesson-container">
        {/* Header */}
        <div className="lesson-header">
          <div
            className="topic-tag"
            style={{
              background: `${topic.color}15`,
              color: topic.color,
            }}
          >
            <span>{topic.icon}</span>
            <span>{topic.name}</span>
          </div>
          <h1>{lesson.title}</h1>
          <p>{lesson.subtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="lesson-progress-bar">
          <span>{currentCard + 1}/{cards.length}</span>
          <div className="progress-bar-container" style={{ flex: 1 }}>
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Audio Listen Mode */}
        {!completed && (
          <AudioPlayer
            textToRead={`${card.title}. ${card.content}`}
            title={`Card ${currentCard + 1}: ${card.title}`}
          />
        )}

        {/* Completed state */}
        {completed && currentCard === cards.length - 1 ? (
          <div className="card quiz-results" style={{ animation: 'scaleIn 0.5s ease-out' }}>
            <div className="quiz-results-emoji">🎉</div>
            <h2>Lesson Complete!</h2>
            <div className="quiz-results-xp">+50 XP</div>
            <p>Great job finishing &quot;{lesson.title}&quot;!</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href={`/quiz/${topicId}/${lessonId}`}
                className="btn btn-primary"
              >
                Take Quiz →
              </Link>
              <Link
                href={`/topics/${topicId}`}
                className="btn btn-secondary"
              >
                Back to {topic.name}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Current card */}
            <div
              className={`card lesson-card-content type-${card.type}`}
              key={card.id}
            >
              {card.emoji && <div className="card-emoji">{card.emoji}</div>}
              <h3>{card.title}</h3>
              <p>{renderContent(card.content, card.highlight)}</p>
            </div>

            {/* Navigation */}
            <div className="lesson-nav">
              <button
                className="btn btn-secondary"
                onClick={handlePrev}
                disabled={currentCard === 0}
                style={{ opacity: currentCard === 0 ? 0.4 : 1 }}
              >
                ← Previous
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
              >
                {isLastCard ? 'Complete Lesson ✓' : 'Next →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
