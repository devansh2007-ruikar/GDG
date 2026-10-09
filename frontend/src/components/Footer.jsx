import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Terminal, Code2, Heart } from 'lucide-react';

const GithubIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

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

        {/* Visible Neo-Brutalist Creator Credit Bar */}
        <div
          style={{
            borderTop: '2px solid var(--border)',
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              flexWrap: 'wrap',
            }}
          >
            <span>Built with ❤️ by</span>
            <a
              href="https://github.com/devansh2007-ruikar"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'inherit',
                fontWeight: 800,
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Devansh Ruikar
            </a>
            <span>for <strong>GDG RBU Recruitment 2026-27</strong></span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="https://github.com/devansh2007-ruikar"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                padding: '0.3rem 0.65rem',
              }}
              title="Devansh Ruikar on GitHub"
            >
              <GithubIcon size={13} />
              <span>@devansh2007-ruikar</span>
            </a>

            <a
              href="https://github.com/devansh2007-ruikar/GDG"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                padding: '0.3rem 0.65rem',
              }}
              title="Project Source Code"
            >
              <Code2 size={13} />
              <span>Repository</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
