'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  textToRead: string;
  title: string;
}

export default function AudioPlayer({ textToRead, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [supported, setSupported] = useState(true);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Select high-quality, human/natural neural voice
      const naturalVoice = voices.find(v =>
        v.lang.startsWith('en') && (
          v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Enhanced') ||
          v.name.includes('Premium') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel') ||
          v.name.includes('Karen') ||
          v.name.includes('Serena')
        )
      ) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];

      selectedVoiceRef.current = naturalVoice;
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (rate: number) => {
    if (!supported) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);

    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }

    utterance.rate = rate;
    utterance.pitch = 1.02; // Warm natural pitch inflection

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speakText(speed);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying) {
      speakText(newSpeed);
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
          <span>{isPlaying ? '⏸️ Pause' : '🎙️ Listen (Natural Voice)'}</span>
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
