'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';
import { getProgress } from '@/lib/storage';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const progress = getProgress();
    setXp(progress.odometer);
    setStreak(progress.streak);
  }, [pathname]);

  const isLanding = pathname === '/';

  const navLinks = [
    { href: '/home', label: 'Home', icon: '🏠' },
    { href: '/topics', label: 'Explore', icon: '🔍' },
    { href: '/progress', label: 'Progress', icon: '📊' },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href={isLanding ? '/' : '/home'} className="navbar-brand">
            <span className="navbar-brand-icon">🧠</span>
            <span>Monstah</span>
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
    </>
  );
}
