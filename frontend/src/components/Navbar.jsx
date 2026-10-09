import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, LogOut, User as UserIcon, Calendar, Ticket, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { success } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
    setMobileMenuOpen(false);
    navigate('/login');
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="container nav-content">
        {/* Brand with Official GDG Logo */}
        <Link 
          to="/events" 
          className="nav-brand" 
          onClick={() => setMobileMenuOpen(false)}
        >
          <img 
            src="/gdg-logo.svg" 
            alt="GDG RBU logo" 
            width="72" 
            height="38" 
            className="gdg-logo" 
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: 'clamp(1.15rem, 3.8vw, 1.4rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              GDG RBU
            </span>
            <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em' }}>
              EVENTS • ON CAMPUS
            </span>
          </div>
        </Link>

        {/* Center Colorful Pill Navigation (Tablet / Desktop: >= 640px) */}
        <div className="nav-pills" style={{ display: 'flex' }}>
          <NavLink
            to="/events"
            className={({ isActive }) => `nav-pill-btn pill-events ${isActive ? 'active' : ''}`}
          >
            Events
          </NavLink>

          {user && (
            <NavLink
              to="/my-registrations"
              className={({ isActive }) => `nav-pill-btn pill-registrations ${isActive ? 'active' : ''}`}
            >
              My Registrations
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-pill-btn pill-admin ${isActive ? 'active' : ''}`}
            >
              Admin
            </NavLink>
          )}
        </div>

        {/* Desktop / Tablet Actions (Hidden on mobile < 640px) */}
        <div className="desktop-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} color="#FFC400" /> : <Moon size={18} color="#0A0A0A" />}
          </button>

          {/* User Auth Info */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.65rem',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-btn)',
                  backgroundColor: 'var(--surface)',
                  boxShadow: 'var(--shadow-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  minHeight: '40px',
                }}
              >
                <UserIcon size={14} />
                <span>{user.name.split(' ')[0]}</span>
                {isAdmin && (
                  <span style={{ background: 'var(--yellow)', color: '#000', padding: '0.1rem 0.35rem', borderRadius: 4, fontSize: '0.68rem', fontWeight: 800 }}>
                    ADMIN
                  </span>
                )}
              </div>
              <button 
                onClick={handleLogout} 
                className="btn btn-outline btn-sm" 
                title="Log Out" 
                style={{ minHeight: '40px', minWidth: '40px', padding: '0 0.6rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm" style={{ minHeight: '40px' }}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm" style={{ minHeight: '40px' }}>
                Join Us
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button (< 640px only) */}
        <button
          ref={hamburgerRef}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="mobile-hamburger-btn btn btn-outline"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          style={{
            width: 44,
            height: 44,
            minWidth: 44,
            minHeight: 44,
            padding: 0,
            display: 'none', /* Shown via CSS on mobile */
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer (Slide-Down Menu) */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          style={{
            borderTop: '2px solid var(--border)',
            backgroundColor: 'var(--bg)',
            padding: '1.25rem 1rem max(1.5rem, env(safe-area-inset-bottom)) 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 'calc(100vh - 65px)',
            overflowY: 'auto',
          }}
        >
          {/* Navigation Links */}
          <NavLink
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="btn pill-events"
            style={{
              width: '100%',
              minHeight: 48,
              justifyContent: 'flex-start',
              backgroundColor: 'var(--blue)',
              color: '#000',
              fontSize: '1rem',
            }}
          >
            <Calendar size={18} />
            <span>Discover Events</span>
          </NavLink>

          {user && (
            <NavLink
              to="/my-registrations"
              onClick={() => setMobileMenuOpen(false)}
              className="btn pill-registrations"
              style={{
                width: '100%',
                minHeight: 48,
                justifyContent: 'flex-start',
                backgroundColor: 'var(--yellow)',
                color: '#000',
                fontSize: '1rem',
              }}
            >
              <Ticket size={18} />
              <span>My Registrations</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="btn pill-admin"
              style={{
                width: '100%',
                minHeight: 48,
                justifyContent: 'flex-start',
                backgroundColor: 'var(--green)',
                color: '#000',
                fontSize: '1rem',
              }}
            >
              <ShieldCheck size={18} />
              <span>Admin Command Center</span>
            </NavLink>
          )}

          {/* Dark Mode Toggle Full-Width */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-outline"
            style={{
              width: '100%',
              minHeight: 48,
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isDark ? <Sun size={18} color="#FFC400" /> : <Moon size={18} color="#0A0A0A" />}
              {isDark ? 'LIGHT MODE' : 'DARK MODE'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700 }}>
              {isDark ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* User Auth Section */}
          <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-btn)',
                    backgroundColor: 'var(--surface)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserIcon size={16} />
                    <span>{user.name}</span>
                  </div>
                  {isAdmin && (
                    <span style={{ background: 'var(--yellow)', color: '#000', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 800 }}>
                      ADMIN
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-red"
                  style={{ width: '100%', minHeight: 48, justifyContent: 'center', fontSize: '0.95rem' }}
                >
                  <LogOut size={16} /> LOG OUT
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-outline"
                  style={{ width: '100%', minHeight: 48, justifyContent: 'center', fontSize: '0.95rem' }}
                >
                  <LogIn size={16} /> LOGIN
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', minHeight: 48, justifyContent: 'center', fontSize: '0.95rem' }}
                >
                  <UserPlus size={16} /> JOIN GDG CLUB
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
