import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Terminal, Code2, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '2px solid var(--border)',
        backgroundColor: 'var(--surface)',
        padding: '3rem 1.5rem 2rem',
        marginTop: 'auto',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '2rem',
          }}
        >
          {/* Brand info with official GDG logo */}
          <div style={{ maxWidth: 440 }}>
            <Link
              to="/events"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                color: 'inherit',
                marginBottom: '1rem',
              }}
            >
              <img
                src="/gdg-logo.svg"
                alt="GDG RBU logo"
                width="72"
                height="38"
                className="gdg-logo"
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  GDG RBU
                </div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em' }}>
                  EVENTS PLATFORM
                </div>
              </div>
            </Link>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--muted)',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Google Developer Groups on Campus • Ramdeobaba University. Discover technical workshops, hands-on hackathons, and speaker sessions with atomic registration safety.
            </p>
          </div>

          {/* Quick navigation */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: 'var(--muted)',
                  marginBottom: '0.85rem',
                }}
              >
                PLATFORM
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <li>
                  <Link to="/events" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Discover Events
                  </Link>
                </li>
                <li>
                  <Link to="/my-registrations" style={{ color: 'inherit', textDecoration: 'none' }}>
                    My Registrations
                  </Link>
                </li>
                <li>
                  <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Admin Command Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: 'var(--muted)',
                  marginBottom: '0.85rem',
                }}
              >
                DEVELOPER
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <li>
                  <a
                    href="https://gdg-oz97.onrender.com/api/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    Swagger API Docs <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://gdg-oz97.onrender.com/api/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    API Health Status <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/devansh2007-ruikar/GDG"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    GitHub Repository <ExternalLink size={12} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div
          style={{
            borderTop: '1px solid var(--grid)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--muted)',
          }}
        >
          <div>
            Built for <strong>GDG RBU Technical Task</strong> • 2026-27
          </div>
          <div>
            Engineered with React 18, Express 5, Prisma & PostgreSQL
          </div>
        </div>
      </div>
    </footer>
  );
};
