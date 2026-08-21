'use client';

import { useState, useRef, useEffect } from 'react';
import { updateStreak, completeLesson, getProgress } from '@/lib/storage';
import { syncUserProgressToCloud } from '@/lib/cloudStorage';
import { playCelebrationSound } from '@/lib/soundEffects';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  charismaScore?: number;
  feedbackTip?: string;
}

interface AiRoleplayModalProps {
  scenarioTitle: string;
  scenarioDescription: string;
  onClose: () => void;
}

export default function AiRoleplayModal({
  scenarioTitle,
  scenarioDescription,
  onClose,
}: AiRoleplayModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi there! I'm ready to practice "${scenarioTitle}". Go ahead and open the conversation whenever you're ready!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [avgScore, setAvgScore] = useState(85);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle,
          scenarioDescription,
          messages: newMessages,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Oops! Unable to connect to AI server. Please try again.' },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            charismaScore: data.charismaScore,
            feedbackTip: data.feedbackTip,
          },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please try sending your message again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    // Calculate average score
    const scores = messages.map(m => m.charismaScore).filter((s): s is number => typeof s === 'number');
    const average = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 85;
    setAvgScore(average);

    // Award +100 XP bonus
    const progress = updateStreak();
    progress.odometer += 100;
    progress.level = Math.floor(progress.odometer / 200) + 1;
    await syncUserProgressToCloud(progress);

    playCelebrationSound();
    setFinished(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 580,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          border: '1px solid var(--primary-500)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.8rem' }}>🤖</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>AI Roleplay Simulator</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {scenarioTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '1.2rem', padding: '4px 10px' }}
          >
            ✕
          </button>
        </div>

        {finished ? (
          /* Finished summary view */
          <div style={{ padding: 32, textAlign: 'center', animation: 'scaleIn 0.4s ease-out' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🏆</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Practice Complete!</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-600)', marginBottom: 8 }}>
              {avgScore}/100
            </div>
            <div className="progress-badge completed" style={{ fontSize: '1rem', padding: '6px 16px', display: 'inline-block', marginBottom: 16 }}>
              ⭐ +100 Bonus Practice XP
            </div>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 24px' }}>
              Awesome job practicing your live communication skills! Keep applying these high-status scripts in real life.
            </p>
            <button className="btn btn-primary btn-lg" onClick={onClose}>
              Done →
            </button>
          </div>
        ) : (
          <>
            {/* Messages Chat Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                minHeight: 300,
                maxHeight: 420,
              }}
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: m.role === 'user' ? 'var(--primary-600)' : 'var(--bg-tertiary)',
                      color: m.role === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                      fontSize: '0.95rem',
                      lineHeight: 1.4,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    {m.content}
                  </div>

                  {/* Feedback rating badge under assistant response */}
                  {m.charismaScore !== undefined && (
                    <div
                      style={{
                        marginTop: 6,
                        padding: '6px 12px',
                        borderRadius: 12,
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>
                        🔥 Charisma Score: {m.charismaScore}/100
                      </span>
                      {m.feedbackTip && (
                        <span style={{ color: 'var(--text-secondary)' }}>• {m.feedbackTip}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  <span>🤖 AI is responding...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div
              style={{
                padding: 14,
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  placeholder="Type what you would say..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                >
                  Send →
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Practice live conversation & build real-world confidence.
                </span>
                <button
                  onClick={handleFinish}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.8rem', color: 'var(--primary-600)' }}
                >
                  Finish Practice ✓
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
