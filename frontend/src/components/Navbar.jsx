import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { success } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        {/* Brand with GDG Chevrons */}
        <Link to="/events" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Authentic GDG Chevron Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left Chevron < in Blue & Red */}
              <path d="M12 7L4 16L12 25" stroke="#4C8DF6" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 16L4 25" stroke="#F86B5E" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Right Chevron > in Yellow & Green */}
              <path d="M20 7L28 16L20 25" stroke="#FFC400" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 7L28 16" stroke="#00D26A" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              GDG RBU
            </span>
            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em' }}>
              EVENTS • ON CAMPUS
            </span>
          </div>
        </Link>

        {/* Desktop Center Colorful Pill Navigation */}
        <div className="nav-pills">
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

        {/* Right Section: Theme Toggle + Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  padding: '0.35rem 0.75rem',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-btn)',
                  backgroundColor: 'var(--surface)',
                  boxShadow: 'var(--shadow-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                }}
              >
                <UserIcon size={14} />
                <span>{user.name.split(' ')[0]}</span>
                {isAdmin && (
                  <span style={{ background: 'var(--yellow)', color: '#000', padding: '0.1rem 0.35rem', borderRadius: 4, fontSize: '0.7rem' }}>
                    ADMIN
                  </span>
                )}
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Log Out">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Join Us
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="btn btn-outline btn-sm mobile-menu-btn"
            style={{ display: 'none' }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '2px solid var(--border)',
            backgroundColor: 'var(--bg)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <NavLink
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-outline"
            style={{ justifyContent: 'flex-start' }}
          >
            🗓️ Discover Events
          </NavLink>
          {user && (
            <NavLink
              to="/my-registrations"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-outline"
              style={{ justifyContent: 'flex-start' }}
            >
              🎟️ My Registrations
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-outline"
              style={{ justifyContent: 'flex-start' }}
            >
              ⚙️ Admin Dashboard
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
};
