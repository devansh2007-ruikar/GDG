import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Code2, ChevronDown, ChevronUp } from 'lucide-react';

const GithubIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const Footer = () => {
  const [linksExpanded, setLinksExpanded] = useState(false);

  return (
    <footer
      className="site-footer"
      style={{
        borderTop: '2px solid var(--border)',
        backgroundColor: 'var(--surface)',
        marginTop: 'auto',
      }}
    >
      <div className="container" style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 3vw, 1.5rem)' }}>
        {/* Desktop / Tablet Full Footer (>= 768px) */}
        <div className="desktop-footer-content">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '2rem',
              marginBottom: '2rem',
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(1.5rem, 5vw, 3rem)' }}>
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
                      href="http://localhost:5000/api/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      Swagger API Docs <ExternalLink size={12} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="http://localhost:5000/api/health"
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

          {/* Desktop Credit Bar */}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <a
                href="https://github.com/devansh2007-ruikar"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ minHeight: 38, fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
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
                style={{ minHeight: 38, fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                title="Project Source Code"
              >
                <Code2 size={13} />
                <span>Repository</span>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Compact Footer (< 768px) */}
        <div className="mobile-footer-compact">
          {/* Logo & Platform Name */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'inherit' }}>
              <img src="/gdg-logo.svg" alt="GDG RBU logo" width="56" height="30" className="gdg-logo" />
              <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1 }}>
                GDG RBU
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setLinksExpanded((prev) => !prev)}
              className="btn btn-outline btn-sm"
              style={{ minHeight: 36, fontSize: '0.75rem', padding: '0.25rem 0.65rem', gap: '0.35rem' }}
              aria-expanded={linksExpanded}
            >
              <span>{linksExpanded ? 'Less' : 'More Links'}</span>
              {linksExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* One line of key links on mobile */}
          <nav 
            aria-label="Footer Quick Links"
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              alignItems: 'center', 
              gap: '0.45rem 0.85rem', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              color: 'var(--text)',
              marginBottom: '0.85rem',
            }}
          >
            <Link to="/events" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>Events</Link>
            <span style={{ color: 'var(--muted)' }}>•</span>
            <Link to="/my-registrations" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>Passes</Link>
            <span style={{ color: 'var(--muted)' }}>•</span>
            <Link to="/admin" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>Admin</Link>
            <span style={{ color: 'var(--muted)' }}>•</span>
            <a href="http://localhost:5000/api/docs" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Docs
            </a>
            <span style={{ color: 'var(--muted)' }}>•</span>
            <a href="https://github.com/devansh2007-ruikar/GDG" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
              GitHub
            </a>
          </nav>

          {/* Collapsible Accordion Links on Mobile */}
          {linksExpanded && (
            <div 
              style={{ 
                borderTop: '1px dashed var(--border)', 
                paddingTop: '0.75rem', 
                marginBottom: '0.85rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: 'var(--muted)', fontSize: '0.7rem', marginBottom: '0.35rem' }}>PLATFORM</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <Link to="/events">Discover Events</Link>
                  <Link to="/my-registrations">My Registrations</Link>
                  <Link to="/admin">Admin Command</Link>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--muted)', fontSize: '0.7rem', marginBottom: '0.35rem' }}>DEVELOPER</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <a href="http://localhost:5000/api/docs" target="_blank" rel="noopener noreferrer">Swagger UI</a>
                  <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">API Health</a>
                  <a href="https://github.com/devansh2007-ruikar/GDG" target="_blank" rel="noopener noreferrer">Source Repo</a>
                </div>
              </div>
            </div>
          )}

          {/* Compact Credit Line */}
          <div
            style={{
              borderTop: '1.5px solid var(--border)',
              paddingTop: '0.65rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              fontSize: '0.785rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div>
              Built by{' '}
              <a
                href="https://github.com/devansh2007-ruikar"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 800, textDecoration: 'underline' }}
              >
                Devansh Ruikar
              </a>
            </div>

            <a
              href="https://github.com/devansh2007-ruikar/GDG"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--muted)' }}
            >
              <GithubIcon size={12} />
              <span>@devansh2007-ruikar</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
