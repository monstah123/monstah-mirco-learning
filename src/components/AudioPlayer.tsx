'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  textToRead: string;
  title: string;
}

export const GEMINI_STUDIO_VOICES = [
  { id: 'kore', label: 'Kore (Female, Warm)', pitch: 1.08, rate: 0.98, preferGender: 'female' },
  { id: 'puck', label: 'Puck (Male, Crisp)', pitch: 1.02, rate: 1.05, preferGender: 'male' },
  { id: 'charon', label: 'Charon (Male, Deep)', pitch: 0.80, rate: 0.92, preferGender: 'male' },
  { id: 'fenrir', label: 'Fenrir (Male, Raspy)', pitch: 0.86, rate: 1.00, preferGender: 'male' },
  { id: 'zephyr', label: 'Zephyr (Female, Gentle)', pitch: 1.15, rate: 0.92, preferGender: 'female' },
];

export default function AudioPlayer({ textToRead, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('kore');
  const [supported, setSupported] = useState(true);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    const loadVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      if (avail && avail.length > 0) {
        voicesRef.current = avail.filter(v => v.lang.startsWith('en'));
      }
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

  const speak = (userSpeed: number) => {
    if (!supported) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);

    const voiceConfig = GEMINI_STUDIO_VOICES.find(v => v.id === selectedVoiceId) || GEMINI_STUDIO_VOICES[0];

    // Pick best matching system voice based on gender preference
    if (voicesRef.current.length > 0) {
      const match = voicesRef.current.find(v => {
        const name = v.name.toLowerCase();
        if (voiceConfig.preferGender === 'male') {
          return name.includes('male') || name.includes('daniel') || name.includes('david') || name.includes('george') || name.includes('alex');
        } else {
          return name.includes('female') || name.includes('samantha') || name.includes('karen') || name.includes('victoria') || name.includes('ava');
        }
      }) || voicesRef.current[0];

      utterance.voice = match;
    }

    // Calibrate pitch and rate specifically for Kore, Puck, Charon, Fenrir, and Zephyr
    utterance.pitch = voiceConfig.pitch;
    utterance.rate = voiceConfig.rate * userSpeed;

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
      speak(speed);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying) {
      speak(newSpeed);
    }
  };

  if (!supported) return null;

  const currentConfig = GEMINI_STUDIO_VOICES.find(v => v.id === selectedVoiceId) || GEMINI_STUDIO_VOICES[0];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 18px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--button-radius)',
      marginBottom: 20,
      gap: 12,
      flexWrap: 'wrap',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={handlePlayPause}
          className={`btn ${isPlaying ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{
            borderRadius: '50px',
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700
          }}
        >
          <span>{isPlaying ? '⏸️ Pause' : `🎙️ Listen: ${currentConfig.label.split(' ')[0]}`}</span>
        </button>

        {/* Clean Gemini Studio Voice Dropdown */}
        <select
          value={selectedVoiceId}
          onChange={(e) => {
            setSelectedVoiceId(e.target.value);
            if (isPlaying) {
              window.speechSynthesis.cancel();
              setIsPlaying(false);
            }
          }}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--button-radius)',
            border: '1px solid var(--border-color-strong)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            outline: 'none',
            cursor: 'pointer',
            minWidth: 210,
          }}
        >
          {GEMINI_STUDIO_VOICES.map(v => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {isPlaying && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ width: 3, height: 14, background: 'var(--primary-500)', animation: 'bounce 0.6s ease-in-out infinite' }} />
          <span style={{ width: 3, height: 20, background: 'var(--primary-500)', animation: 'bounce 0.6s ease-in-out infinite 0.2s' }} />
          <span style={{ width: 3, height: 10, background: 'var(--primary-500)', animation: 'bounce 0.6s ease-in-out infinite 0.4s' }} />
        </div>
      )}

      {/* Speed Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {[1.0, 1.25, 1.5].map(s => (
          <button
            key={s}
            onClick={() => handleSpeedChange(s)}
            style={{
              padding: '4px 10px',
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
