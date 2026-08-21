'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateStreak, getProgress } from '@/lib/storage';
import { syncUserProgressToCloud } from '@/lib/cloudStorage';

interface LeaderboardUser {
  id: string;
  email: string;
  odometer: number;
  streak: number;
  level: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadLeaderboard() {
      // Ensure user streak is active and cloud synced before loading rankings
      const activeProgress = updateStreak();
      await syncUserProgressToCloud(activeProgress);

      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('id, odometer, streak, level')
          .order('odometer', { ascending: false })
          .limit(20);

        if (!error && data && data.length > 0) {
          const formatted: LeaderboardUser[] = data.map((item, index) => {
            const rawStreak = item.streak || 0;
            const streakVal = rawStreak === 0 && (item.odometer || 0) > 0 ? 1 : rawStreak;
            return {
              id: item.id,
              email: `Learner #${index + 101}`,
              odometer: item.odometer || 0,
              streak: streakVal,
              level: item.level || 1,
            };
          });
          setLeaders(formatted);
        } else {
          // Fallback demo rankings if empty
          const localProgress = getProgress();
          setLeaders([
            { id: 'local', email: 'You (Current User)', odometer: localProgress.odometer, streak: localProgress.streak || 1, level: localProgress.level },
            { id: 'u2', email: 'alex_growth', odometer: 450, streak: 5, level: 3 },
            { id: 'u3', email: 'sam_micro', odometer: 320, streak: 3, level: 2 },
            { id: 'u4', email: 'jordan_wisdom', odometer: 200, streak: 2, level: 2 },
            { id: 'u5', email: 'taylor_mind', odometer: 150, streak: 1, level: 1 },
          ].sort((a, b) => b.odometer - a.odometer));
        }
      } catch {
        const localProgress = getProgress();
        setLeaders([
          { id: 'local', email: 'You (Current User)', odometer: localProgress.odometer, streak: localProgress.streak || 1, level: localProgress.level },
          { id: 'u2', email: 'alex_growth', odometer: 450, streak: 5, level: 3 },
          { id: 'u3', email: 'sam_micro', odometer: 320, streak: 3, level: 2 },
        ].sort((a, b) => b.odometer - a.odometer));
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [supabase]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🏆 Global Leaderboard</h1>
        <p>Top micro-learners competing by total XP and daily streaks.</p>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚙️</div>
          <h3>Loading Rankings...</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640, margin: '0 auto' }}>
          {leaders.map((leader, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;

            return (
              <div
                key={leader.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: isTop3
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                    : 'var(--bg-card)',
                  borderColor: isTop3 ? 'var(--primary-400)' : 'var(--border-color)',
                  transform: isTop3 ? 'scale(1.02)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    fontSize: isTop3 ? '1.5rem' : '1rem',
                    fontWeight: 800,
                    width: 36,
                    textAlign: 'center',
                    color: 'var(--primary-600)',
                  }}>
                    {getRankBadge(rank)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{leader.email}</span>
                      <span style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 50 }}>
                        Lv.{leader.level}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      🔥 {leader.streak} Day Streak
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                    ⭐ {leader.odometer} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
