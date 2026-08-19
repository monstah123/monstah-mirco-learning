'use client';

import { useState, useRef } from 'react';

interface AudioPlayerProps {
  textToRead: string;
  title: string;
}

export const GEMINI_STUDIO_VOICES = [
  { id: 'kore', label: 'Kore (Female, Warm)' },
  { id: 'puck', label: 'Puck (Male, Crisp)' },
  { id: 'charon', label: 'Charon (Male, Deep)' },
  { id: 'fenrir', label: 'Fenrir (Male, Raspy)' },
  { id: 'zephyr', label: 'Zephyr (Female, Gentle)' },
];

export default function AudioPlayer({ textToRead, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('kore');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    // If audio element already exists and has source loaded, resume
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.playbackRate = speed;
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead, voiceId: selectedVoiceId }),
      });

      const data = await response.json();

      if (data.audioContent) {
        const audio = new Audio(data.audioContent);
        audio.playbackRate = speed;
        audioRef.current = audio;

        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);

        await audio.play();
        setIsPlaying(true);
      } else {
        // Fallback to browser TTS if API encounters limit
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = speed;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Audio playback error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const handleVoiceChange = (newVoiceId: string) => {
    setSelectedVoiceId(newVoiceId);
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    } else {
      audioRef.current = null;
    }
  };

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
          disabled={loading}
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
          {loading ? (
            <>
              <span className="spinner" style={{ animation: 'rotate 1s linear infinite' }}>⚙️</span>
              Synthesizing HD Audio...
            </>
          ) : (
            <>
              <span>{isPlaying ? '⏸️ Pause' : `🎙️ Listen: ${currentConfig.label.split(' ')[0]}`}</span>
            </>
          )}
        </button>

        {/* Gemini Studio Voice Dropdown */}
        <select
          value={selectedVoiceId}
          onChange={(e) => handleVoiceChange(e.target.value)}
          disabled={loading}
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
