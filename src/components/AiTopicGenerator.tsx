'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveCustomTopicPackage, getCustomTopicPackages } from '@/lib/storage';
import { TOPICS } from '@/lib/content';

interface AiTopicGeneratorProps {
  onSearchChange?: (term: string) => void;
  initialQuery?: string;
}

export default function AiTopicGenerator({ onSearchChange, initialQuery = '' }: AiTopicGeneratorProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(query);
    }
  }, [query, onSearchChange]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate topic');
      }

      // Save custom topic package to localStorage so it permanently appears in Explore & Home
      saveCustomTopicPackage(data);

      // Reset search query
      setQuery('');

      // Navigate directly to the new lesson!
      router.push(`/lesson/${data.topic.id}/${data.lesson.id}`);
    } catch (err: unknown) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 32, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)', borderColor: 'var(--primary-400)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: '1.4rem' }}>🔍</span>
        <h3 style={{ fontSize: '1.15rem' }}>Search or Generate Any Topic</h3>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
        Search existing categories below, or type any custom topic to generate a brand new AI lesson & quiz!
      </p>

      <form onSubmit={handleGenerate} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a topic (e.g. Negotiation, Bitcoin, Artisanal Coffee, Public Speaking)..."
          disabled={loading}
          style={{
            flex: 1,
            minWidth: 260,
            padding: '12px 18px',
            borderRadius: 'var(--button-radius)',
            border: '1px solid var(--border-color-strong)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !query.trim()}
          style={{ opacity: loading || !query.trim() ? 0.7 : 1 }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{ display: 'inline-block', animation: 'rotate 1s linear infinite' }}>⚙️</span>
              Creating...
            </>
          ) : (
            <>✨ Generate with AI</>
          )}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--button-radius)', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
