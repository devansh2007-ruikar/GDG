import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/events';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Invalid email or password';
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div 
        className="card" 
        style={{ 
          width: '100%', 
          maxWidth: 460, 
          padding: '2.5rem',
          border: '3px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 0,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/events" title="Return to GDG Events" style={{ display: 'inline-block', marginBottom: '1.25rem' }}>
            <img src="/gdg-logo.svg" alt="GDG RBU logo" width="72" height="38" className="gdg-logo" />
          </Link>
          <div>
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                backgroundColor: 'var(--yellow)', 
                color: '#000', 
                border: '2px solid var(--border)', 
                padding: '0.25rem 0.75rem', 
                borderRadius: 'var(--radius-pill)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <KeyRound size={12} /> AUTHENTICATION
            </div>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.35rem', lineHeight: 1.1 }}>
            Member Sign In
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.925rem' }}>
            Access event passes and administrative portals.
          </p>
        </div>

        {formError && (
          <div className="alert-box alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">EMAIL ADDRESS</label>
            <input
              type="email"
              className="input"
              placeholder="user1@gdg.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-blue"
            style={{ width: '100%', marginTop: '0.5rem', height: 48, justifyContent: 'center' }}
          >
            {loading ? <span className="spinner"></span> : <><LogIn size={16} /> SIGN IN</>}
          </button>
        </form>

        {/* Quick Demo Credentials Autofill */}
        <div 
          style={{ 
            marginTop: '1.75rem', 
            padding: '1rem', 
            backgroundColor: 'var(--bg)', 
            border: '2px dashed var(--border)', 
            borderRadius: 'var(--radius-btn)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text)' }}>
            DEMO PRESETS:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => handleFillDemo('admin@gdg.com', 'Admin@123')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Fill Admin
            </button>
            <button 
              type="button" 
              onClick={() => handleFillDemo('user1@gdg.com', 'User@123')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Fill Attendee
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--muted)' }}>Don't have an account? </span>
          <Link to="/signup" style={{ color: 'var(--blue)', fontWeight: 800, textDecoration: 'underline' }}>
            Join the Club
          </Link>
        </div>
      </div>
    </div>
  );
};
