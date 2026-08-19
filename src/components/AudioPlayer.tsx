'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  textToRead: string;
  title: string;
}

interface VoiceOption {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  voice: SpeechSynthesisVoice;
}

export default function AudioPlayer({ textToRead, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [supported, setSupported] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    const loadVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      if (!avail || avail.length === 0) return;

      const englishVoices = avail.filter(v => v.lang.startsWith('en'));

      const mapped: VoiceOption[] = englishVoices.map((v, i) => {
        const lowerName = v.name.toLowerCase();
        const isMale = lowerName.includes('male') || lowerName.includes('daniel') || lowerName.includes('david') || lowerName.includes('george') || lowerName.includes('arthur') || lowerName.includes('alex') || lowerName.includes('fred');
        const isFemale = lowerName.includes('female') || lowerName.includes('samantha') || lowerName.includes('karen') || lowerName.includes('victoria') || lowerName.includes('zira') || lowerName.includes('ava') || lowerName.includes('siri');

        const gender = isMale ? 'Male' : isFemale ? 'Female' : (i % 2 === 0 ? 'Female' : 'Male');
        const cleanName = v.name.replace(/Microsoft|Google|Apple|Desktop|Online \(Natural\)/gi, '').trim();

        return {
          id: `${v.name}-${v.lang}`,
          name: `🎙️ ${gender}: ${cleanName || 'Studio Voice'}`,
          gender,
          voice: v,
        };
      });

      // Filter out duplicate or low quality fallbacks
      const unique = mapped.filter((v, index, self) => index === self.findIndex(t => t.name === v.name));

      setVoices(unique);
      if (unique.length > 0 && !selectedVoiceId) {
        setSelectedVoiceId(unique[0].id);
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
  }, [selectedVoiceId]);

  const speak = (rate: number) => {
    if (!supported) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);

    const chosen = voices.find(v => v.id === selectedVoiceId);
    if (chosen) {
      utterance.voice = chosen.voice;
      // Adjust pitch slightly for male vs female natural warmth
      utterance.pitch = chosen.gender === 'Female' ? 1.05 : 0.95;
    }

    utterance.rate = rate;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      if (audioRef.current) audioRef.current.pause();
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
          <span>{isPlaying ? '⏸️ Pause' : '🎙️ Listen Lesson'}</span>
        </button>

        {/* Voice Selector Dropdown (Male & Female Studio Options) */}
        {voices.length > 0 && (
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
              padding: '6px 12px',
              borderRadius: 'var(--button-radius)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
              maxWidth: 210,
            }}
          >
            {voices.map(v => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        )}
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
