'use client';

import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { getLessonById, getTopicById } from '@/lib/content';
import { completeLesson, getProgress, getCustomTopicPackages } from '@/lib/storage';
import { syncUserProgressToCloud } from '@/lib/cloudStorage';
import { Lesson, Topic, LessonDecisionOption } from '@/lib/types';
import AudioPlayer from '@/components/AudioPlayer';
import { playWinningSound, playLosingSound } from '@/lib/soundEffects';
import AiRoleplayModal from '@/components/AiRoleplayModal';

export default function LessonPage({ params }: { params: Promise<{ topicId: string; lessonId: string }> }) {
  const { topicId, lessonId } = use(params);
  const [currentCard, setCurrentCard] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [lesson, setLesson] = useState<Lesson | undefined>(undefined);
  const [topic, setTopic] = useState<Topic | undefined>(undefined);
  const [selectedChoice, setSelectedChoice] = useState<LessonDecisionOption | null>(null);
  const [showRoleplayModal, setShowRoleplayModal] = useState(false);

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
    setSelectedChoice(null);
    if (isLastCard) {
      handleComplete();
    } else {
      setCurrentCard(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setSelectedChoice(null);
    if (currentCard > 0) {
      setCurrentCard(prev => prev - 1);
    }
  };

  const handleSelectOption = (opt: LessonDecisionOption) => {
    setSelectedChoice(opt);
    if (opt.status === 'best' || opt.status === 'good') {
      playWinningSound();
    } else {
      playLosingSound();
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
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowRoleplayModal(true)}
                style={{ background: 'linear-gradient(135deg, #FF3366 0%, #E67E22 100%)', border: 'none' }}
              >
                🤖 Practice Live with AI →
              </button>
              <Link
                href={`/quiz/${topicId}/${lessonId}`}
                className="btn btn-secondary"
              >
                Take Quiz 📝
              </Link>
              <Link
                href={`/topics/${topicId}`}
                className="btn btn-ghost"
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
              style={{ position: 'relative', overflow: 'hidden', padding: '36px 24px 32px' }}
            >
              <div style={{ position: 'absolute', top: 12, left: 16, right: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="progress-badge in-progress">Card {currentCard + 1} of {cards.length}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-600)' }}>{Math.round(progressPct)}%</span>
              </div>

              {card.contextHeader && (
                <div className="card-context-pill" style={{ marginTop: 14 }}>
                  {card.contextHeader}
                </div>
              )}

              {card.emoji && !card.contextHeader && (
                <div className="card-emoji" style={{ marginTop: 16 }}>{card.emoji}</div>
              )}

              <h3>{card.title}</h3>

              {card.type === 'scenario' ? (
                <div className="card-scenario-narrative">
                  &ldquo;{renderContent(card.content, card.highlight)}&rdquo;
                </div>
              ) : (
                <p>{renderContent(card.content, card.highlight)}</p>
              )}

              {/* SmartyMe Script & Dialogue Phrasing Examples */}
              {card.examples && card.examples.length > 0 && (
                <div className="dialogue-script-list">
                  {card.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className={`dialogue-script-card ${ex.status || 'good'}`}
                    >
                      {ex.label && (
                        <div className={`dialogue-script-tag ${ex.status || 'good'}`}>
                          {ex.label}
                        </div>
                      )}
                      <div>&ldquo;{ex.text}&rdquo;</div>
                    </div>
                  ))}
                </div>
              )}

              {/* SmartyMe Interactive Decision Choice Cards */}
              {card.type === 'choice' && card.options && card.options.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 12, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    👇 Select What You Would Say:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {card.options.map((opt, idx) => {
                      const isSelected = selectedChoice?.text === opt.text;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(opt)}
                          className="card card-clickable"
                          style={{
                            textAlign: 'left',
                            padding: '14px 18px',
                            borderRadius: 14,
                            border: isSelected
                              ? opt.status === 'best' || opt.status === 'good'
                                ? '2px solid var(--primary-500)'
                                : '2px solid #EF4444'
                              : '1px solid var(--border-color)',
                            background: isSelected
                              ? opt.status === 'best' || opt.status === 'good'
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(239, 68, 68, 0.1)'
                              : 'var(--bg-tertiary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              background: 'var(--bg-card)',
                              padding: '2px 8px',
                              borderRadius: 50,
                              color: 'var(--text-secondary)'
                            }}>
                              Option {String.fromCharCode(65 + idx)}
                            </span>
                            {opt.label && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: opt.status === 'best' ? '#10B981' : opt.status === 'good' ? '#F59E0B' : '#EF4444' }}>
                                {opt.label}
                              </span>
                            )}
                          </div>
                          <div style={{ marginTop: 6, fontWeight: 600, fontSize: '0.95rem' }}>
                            &ldquo;{opt.text}&rdquo;
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback breakdown card */}
                  {selectedChoice && (
                    <div style={{
                      marginTop: 16,
                      padding: 16,
                      borderRadius: 14,
                      animation: 'scaleIn 0.3s ease-out',
                      background: selectedChoice.status === 'best' || selectedChoice.status === 'good' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: selectedChoice.status === 'best' || selectedChoice.status === 'good' ? '1px solid var(--primary-500)' : '1px solid #EF4444'
                    }}>
                      <div style={{ fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {selectedChoice.status === 'best' ? '🌟 Winning Line (+10 Bonus XP!)' : selectedChoice.status === 'good' ? '👍 Good Line' : '❌ Awkward / Low-Status Phrasing'}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {selectedChoice.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="card-bottom-progress">
                <div className="card-bottom-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
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

      {/* AI Roleplay Practice Modal */}
      {showRoleplayModal && (
        <AiRoleplayModal
          scenarioTitle={lesson.title}
          scenarioDescription={lesson.subtitle}
          onClose={() => setShowRoleplayModal(false)}
        />
      )}
    </div>
  );
}
