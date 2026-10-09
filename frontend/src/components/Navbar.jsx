import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
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
        <Link to="/events" className="nav-brand">
          <div className="nav-logo-dots">
            <span className="dot blue"></span>
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>
          <span>GDG Events</span>
        </Link>

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Discover Events
          </NavLink>

          {user && (
            <NavLink to="/my-registrations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Registrations
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Admin Portal
            </NavLink>
          )}
        </div>

        <div className="nav-auth">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="user-badge">
                <span>👤</span>
                <span style={{ fontWeight: 600 }}>{user.name}</span>
                {isAdmin && <span className="role-tag">ADMIN</span>}
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'none' }} // Visible on mobile via CSS if needed
            aria-label="Toggle Navigation Menu"
          >
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
};
