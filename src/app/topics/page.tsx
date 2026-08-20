'use client';

import Link from 'next/link';
import { TOPICS } from '@/lib/content';
import { useEffect, useState } from 'react';
import { getProgress, getCustomTopicPackages } from '@/lib/storage';
import { UserProgress, DEFAULT_PROGRESS, Topic } from '@/lib/types';
import AiTopicGenerator from '@/components/AiTopicGenerator';

export default function TopicsPage() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [customPackages, setCustomPackages] = useState<ReturnType<typeof getCustomTopicPackages>>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setProgress(getProgress());
    setCustomPackages(getCustomTopicPackages());
  }, []);

  const allTopics: Topic[] = [
    ...customPackages.map(pkg => pkg.topic),
    ...TOPICS,
  ];

  // Filter topics based on search term
  const filteredTopics = allTopics.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Explore Topics ({allTopics.length})</h1>
        <p>Search existing subjects or generate a custom AI topic to add to your library.</p>
      </div>

      {/* Search & AI Generator Bar */}
      <AiTopicGenerator onSearchChange={setSearchTerm} />

      {/* Topic Grid */}
      {filteredTopics.length > 0 ? (
        <div className="topics-grid">
          {filteredTopics.map(topic => {
            const completed = progress.topicProgress[topic.id] || 0;
            const total = topic.lessonCount;
            const pct = Math.round((completed / total) * 100);
            const isAi = customPackages.some(pkg => pkg.topic.id === topic.id);

            return (
              <Link href={`/topics/${topic.id}`} key={topic.id} style={{ textDecoration: 'none' }}>
                <div className="card card-clickable topic-card" style={{ '--topic-color': topic.color } as React.CSSProperties}>
                  {isAi && (
                    <span style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary-600)', padding: '2px 8px', borderRadius: 50, fontWeight: 700 }}>
                      ✨ AI Custom
                    </span>
                  )}
                  <div>
                    <span className="topic-card-icon">{topic.icon}</span>
                    <h3>{topic.name}</h3>
                    <p>{topic.description}</p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="progress-bar-container" style={{ marginBottom: 12 }}>
                      <div className={`progress-bar-fill ${pct === 100 ? 'complete' : ''}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="topic-card-footer">
                      <span className="topic-card-count">{completed}/{total} completed</span>
                      <span className="btn btn-sm btn-primary">{pct === 100 ? 'Review ✓' : 'Start →'}</span>
                    </div>
                  </div>
                  <div className="card-bottom-progress">
                    <div className={`card-bottom-progress-fill ${pct === 100 ? 'completed' : ''}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: 24 }}>
          <div className="empty-state-icon">🤖</div>
          <h3>No existing topic matches &quot;{searchTerm}&quot;</h3>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: 20 }}>
            Click the &quot;✨ Generate with AI&quot; button above to create a brand new bite-sized lesson on &quot;{searchTerm}&quot;!
          </p>
        </div>
      )}
    </div>
  );
}
