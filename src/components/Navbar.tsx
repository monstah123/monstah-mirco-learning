'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';
import { getProgress } from '@/lib/storage';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import AuthModal from './AuthModal';
import { fetchUserProgressFromCloud } from '@/lib/cloudStorage';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const progress = getProgress();
    setXp(progress.odometer);
    setStreak(progress.streak);

    // Check user session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchUserProgressFromCloud().then(p => {
          if (p) {
            setXp(p.odometer);
            setStreak(p.streak);
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [pathname, supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const isLanding = pathname === '/';

  const navLinks = [
    { href: '/home', label: 'Home', icon: '🏠' },
    { href: '/topics', label: 'Explore', icon: '🔍' },
    { href: '/leaderboard', label: 'Ranks', icon: '🏆' },
    { href: '/progress', label: 'Progress', icon: '📊' },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href={isLanding ? '/' : '/home'} className="navbar-brand">
            <div className="logo-brush-glow" style={{ width: 34, height: 34, borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src="/icon.png"
                alt="Monstah Logo"
                width={34}
                height={34}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <span style={{ fontWeight: 800, background: 'linear-gradient(135deg, var(--primary-500) 0%, #3498DB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Monstah
            </span>
          </Link>

          {!isLanding && (
            <div className="navbar-links">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`navbar-link ${pathname === link.href || pathname.startsWith(link.href + '/') ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="navbar-right">
            {!isLanding && streak > 0 && (
              <div className="streak-badge">
                🔥 {streak}
              </div>
            )}
            {!isLanding && (
              <div className="xp-badge">
                ⭐ {xp} XP
              </div>
            )}

            {/* User Auth Controls */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  👤 {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="btn btn-primary btn-sm"
              >
                Sign In
              </button>
            )}

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {!isLanding && (
        <div className="bottom-nav">
          <div className="bottom-nav-inner">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`bottom-nav-item ${pathname === link.href || pathname.startsWith(link.href + '/') ? 'active' : ''}`}
              >
                <span className="bottom-nav-item-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsAuthOpen(false)}
      />
    </>
  );
}
