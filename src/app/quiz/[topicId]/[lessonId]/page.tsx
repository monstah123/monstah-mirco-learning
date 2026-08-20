'use client';

import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { getQuizByLessonId, getTopicById, getLessonById } from '@/lib/content';
import { saveQuizScore, getCustomTopicPackages } from '@/lib/storage';
import { syncUserProgressToCloud } from '@/lib/cloudStorage';
import { Quiz, Lesson, Topic } from '@/lib/types';
import { playWinningSound, playLosingSound, playCelebrationSound } from '@/lib/soundEffects';

export default function QuizPage({ params }: { params: Promise<{ topicId: string; lessonId: string }> }) {
  const { topicId, lessonId } = use(params);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const [quiz, setQuiz] = useState<Quiz | undefined>(undefined);
  const [topic, setTopic] = useState<Topic | undefined>(undefined);
  const [lesson, setLesson] = useState<Lesson | undefined>(undefined);

  useEffect(() => {
    let foundQuiz = getQuizByLessonId(lessonId);
    let foundTopic = getTopicById(topicId);
    let foundLesson = getLessonById(lessonId);

    if (!foundQuiz || !foundTopic || !foundLesson) {
      const customPackages = getCustomTopicPackages();
      const customPkg = customPackages.find(p => p.lesson.id === lessonId || p.topic.id === topicId);
      if (customPkg) {
        foundQuiz = customPkg.quiz;
        foundTopic = customPkg.topic;
        foundLesson = customPkg.lesson;
      }
    }

    setQuiz(foundQuiz);
    setTopic(foundTopic);
    setLesson(foundLesson);
  }, [topicId, lessonId]);

  if (!quiz || !topic || !lesson) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Quiz not found</h3>
          <Link href="/topics" className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Topics
          </Link>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const letters = ['A', 'B', 'C', 'D'];

  const handleSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);

    const isCorrect = index === question.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      playWinningSound();
    } else {
      playLosingSound();
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      const finalScore = score;
      const updatedProgress = saveQuizScore(quiz.id, finalScore, questions.length);
      await syncUserProgressToCloud(updatedProgress);
      playCelebrationSound();
      setFinished(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const getResultEmoji = () => {
    const pct = score / questions.length;
    if (pct === 1) return '🏆';
    if (pct >= 0.7) return '🎉';
    if (pct >= 0.5) return '👍';
    return '💪';
  };

  const getResultMessage = () => {
    const pct = score / questions.length;
    if (pct === 1) return 'Perfect Score! Incredible!';
    if (pct >= 0.7) return 'Great Job! Well done!';
    if (pct >= 0.5) return 'Good effort! Keep learning!';
    return 'Keep practicing! You\'ll get there!';
  };

  const getXpEarned = () => {
    const pct = score / questions.length;
    if (pct === 1) return 100;
    if (pct >= 0.7) return 50;
    return 25;
  };

  if (finished) {
    return (
      <div className="page-container">
        <div className="quiz-container">
          <div className="card quiz-results">
            <div className="quiz-results-emoji">{getResultEmoji()}</div>
            <h2>{getResultMessage()}</h2>
            <div className="quiz-results-score">{score}/{questions.length}</div>
            <div className="quiz-results-xp">⭐ +{getXpEarned()} XP</div>
            <p>You answered {score} out of {questions.length} questions correctly.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={`/topics/${topicId}`} className="btn btn-primary">
                Continue Learning →
              </Link>
              <Link href="/home" className="btn btn-secondary">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="quiz-container">
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
            <span>Quiz: {lesson.title}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="lesson-progress-bar" style={{ marginBottom: 24 }}>
          <span>{currentQuestion + 1}/{questions.length}</span>
          <div className="progress-bar-container" style={{ flex: 1 }}>
            <div
              className="progress-bar-fill"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card quiz-question-card" key={question.id} style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="quiz-question-number">
            Question {currentQuestion + 1} of {questions.length}
            {question.type === 'true_false' && ' • True or False'}
          </div>
          <div className="quiz-question-text">{question.question}</div>

          <div className="quiz-options">
            {question.options.map((option, index) => {
              let className = 'quiz-option';
              if (showExplanation) {
                if (index === question.correctIndex) className += ' correct';
                else if (index === selectedOption) className += ' incorrect';
              } else if (index === selectedOption) {
                className += ' selected';
              }

              return (
                <button
                  key={index}
                  className={className}
                  onClick={() => handleSelect(index)}
                  disabled={showExplanation}
                >
                  <span className="quiz-option-letter">
                    {showExplanation
                      ? index === question.correctIndex
                        ? '✓'
                        : index === selectedOption
                          ? '✗'
                          : letters[index]
                      : letters[index]}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="quiz-explanation">
              <strong>
                {selectedOption === question.correctIndex ? '✅ Correct! ' : '❌ Not quite. '}
              </strong>
              {question.explanation}
            </div>
          )}
          <div className="card-bottom-progress">
            <div className="card-bottom-progress-fill" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Next button */}
        {showExplanation && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button className="btn btn-primary btn-lg" onClick={handleNext}>
              {isLastQuestion ? 'See Results →' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
