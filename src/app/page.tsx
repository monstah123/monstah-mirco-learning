'use client';

import Link from 'next/link';
import { TOPICS } from '@/lib/content';

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">🧠 Micro Learning Platform</div>
          <h1>Learn Something<br />New Every Day</h1>
          <p>
            Turn idle moments into knowledge. Bite-sized lessons on History, Science,
            Art, Math & more — powered by AI, designed for curious minds.
          </p>
          <div className="landing-cta-group">
            <Link href="/home" className="btn btn-primary btn-lg">
              Start Learning Free →
            </Link>
            <Link href="/topics" className="btn btn-secondary btn-lg">
              Explore Topics
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <h2>Why Monstah?</h2>
        <div className="landing-features-grid">
          <div className="card feature-card">
            <div className="feature-card-icon">⚡</div>
            <h3>3-5 Minute Lessons</h3>
            <p>Each lesson is designed to teach you one fascinating concept in just a few minutes. Perfect for your commute, lunch break, or bedtime.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-card-icon">🧪</div>
            <h3>Interactive Quizzes</h3>
            <p>Test your knowledge with fun quizzes after every lesson. Get instant feedback and detailed explanations for every answer.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-card-icon">🔥</div>
            <h3>Streaks & XP</h3>
            <p>Build daily learning streaks, earn XP, level up, and unlock achievements. Learning has never been this motivating.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-card-icon">🤖</div>
            <h3>AI-Powered Content</h3>
            <p>Our content is crafted with AI to be accurate, engaging, and perfectly sized for micro-learning. Always fresh, always fascinating.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-card-icon">📱</div>
            <h3>Works Everywhere</h3>
            <p>Access your lessons on any device. Our responsive design feels native whether you&apos;re on phone, tablet, or desktop.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-card-icon">🌙</div>
            <h3>Dark Mode</h3>
            <p>Easy on the eyes with a beautiful dark mode. Learn comfortably any time of day or night.</p>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="landing-subjects">
        <div className="landing-subjects-inner">
          <h2>8 Topics, 24+ Lessons</h2>
          <p>Explore a growing library of curated micro-lessons across fascinating subjects.</p>
          <div className="subjects-marquee">
            {TOPICS.map(topic => (
              <Link href="/topics" key={topic.id} className="subject-pill">
                <span>{topic.icon}</span>
                <span>{topic.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-features" style={{ textAlign: 'center', paddingBottom: 100 }}>
        <h2>Ready to Get Smarter?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 32px' }}>
          Join thousands of curious minds who are learning something new every day with Monstah.
        </p>
        <Link href="/home" className="btn btn-primary btn-lg">
          Start Learning Now →
        </Link>
      </section>
    </div>
  );
}
