import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (name.trim().length < 2) {
      setFormError('Name must be at least 2 characters long.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setFormError('Password must contain at least one letter and one number.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(name.trim(), email.trim(), password);
      success(`Welcome to GDG, ${user.name}! Account created.`);
      navigate('/events', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Please try again.';
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div 
        className="card" 
        style={{ 
          width: '100%', 
          maxWidth: 480, 
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
                backgroundColor: 'var(--green)', 
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
              <Sparkles size={12} /> NEW MEMBERSHIP
            </div>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.35rem', lineHeight: 1.1 }}>
            Join GDG RBU
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.925rem' }}>
            Connect with our developer community and claim seats.
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
            <label className="form-label">FULL NAME</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">EMAIL ADDRESS</label>
            <input
              type="email"
              className="input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">PASSWORD (MIN 8 CHARS, 1 LETTER + 1 NUMBER)</label>
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
            className="btn btn-green"
            style={{ width: '100%', marginTop: '0.5rem', height: 48, justifyContent: 'center' }}
          >
            {loading ? <span className="spinner"></span> : <><UserPlus size={16} /> CREATE ACCOUNT</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--muted)' }}>Already an active member? </span>
          <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 800, textDecoration: 'underline' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
