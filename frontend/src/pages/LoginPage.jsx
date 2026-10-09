import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>Log in to GDG</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Access your event registrations and profile</p>
        </div>

        {formError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="user@gdg.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', height: 44 }}
          >
            {loading ? <span className="spinner"></span> : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign up
          </Link>
        </div>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
          <strong>Demo credentials:</strong><br />
          Admin: <code>admin@gdg.com</code> / <code>Admin@123</code><br />
          User: <code>user1@gdg.com</code> / <code>User@123</code>
        </div>
      </div>
    </div>
  );
};
