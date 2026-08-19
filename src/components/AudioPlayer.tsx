'use client';

import { useState, useEffect } from 'react';

interface AudioPlayerProps {
  textToRead: string;
  title: string;
}

export default function AudioPlayer({ textToRead, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!supported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = speed;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = newSpeed;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!supported) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--button-radius)',
      marginBottom: 20,
      gap: 12,
      flexWrap: 'wrap',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={handlePlayPause}
          className={`btn ${isPlaying ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{
            borderRadius: '50px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700
          }}
        >
          <span>{isPlaying ? '⏸️ Pause' : '🔊 Listen'}</span>
        </button>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </div>
      </div>

      {isPlaying && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ width: 3, height: 12, background: 'var(--primary-500)', animation: 'bounce 0.6s ease-in-out infinite' }} />
          <span style={{ width: 3, height: 18, background: 'var(--primary-500)', animation: 'bounce 0.6s ease-in-out infinite 0.2s' }} />
          <span style={{ width: 3, height: 8, background: 'var(--primary-500)', animation: 'bounce 0.6s ease-in-out infinite 0.4s' }} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {[1.0, 1.25, 1.5].map(s => (
          <button
            key={s}
            onClick={() => handleSpeedChange(s)}
            style={{
              padding: '2px 8px',
              borderRadius: 50,
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              background: speed === s ? 'var(--primary-500)' : 'var(--bg-tertiary)',
              color: speed === s ? '#FFF' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
