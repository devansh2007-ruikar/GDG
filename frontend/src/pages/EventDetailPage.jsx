import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingScreen } from '../components/LoadingScreen';

export const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        if (res.data.success) {
          setEvent(res.data.data);
        }
      } catch (err) {
        error(err.response?.data?.error?.message || 'Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, error, navigate]);

  if (loading) {
    return <LoadingScreen message="Loading event details..." />;
  }

  if (!event) return null;

  const isFull = event.seatsLeft === 0;
  const isPast = new Date(event.dateTime).getTime() <= Date.now();
  const fillPercentage = Math.min(100, (event.registeredCount / event.capacity) * 100);
  const seatsLeftPercentage = (event.seatsLeft / event.capacity) * 100;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'tech': return 'badge-tech';
      case 'workshop': return 'badge-workshop';
      case 'hackathon': return 'badge-hackathon';
      case 'meetup': return 'badge-meetup';
      case 'talk': return 'badge-talk';
      default: return 'badge-default';
    }
  };

  const handleRegister = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/events/${id}/register`);
      if (res.data.success) {
        success('You are registered! Seat confirmed.');
        setEvent((prev) => ({
          ...prev,
          isRegistered: true,
          registeredCount: prev.registeredCount + 1,
          seatsLeft: Math.max(0, prev.seatsLeft - 1),
        }));
      }
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to register');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration? Your seat will be given to another member.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/events/${id}/register`);
      success('Successfully unregistered from event');
      setEvent((prev) => ({
        ...prev,
        isRegistered: false,
        registeredCount: Math.max(0, prev.registeredCount - 1),
        seatsLeft: prev.seatsLeft + 1,
      }));
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to cancel registration');
    } finally {
      setActionLoading(false);
    }
  };

  const renderActionButton = (isFullWidth = false) => {
    const btnStyle = isFullWidth 
      ? { width: '100%', minHeight: 48, fontSize: '1rem', justifyContent: 'center' } 
      : { minWidth: 220, minHeight: 48 };

    if (!user) {
      return (
        <Link to="/login" className="btn btn-primary btn-lg" style={btnStyle}>
          🔑 LOGIN TO REGISTER
        </Link>
      );
    }
    if (event.isRegistered) {
      return (
        <button
          onClick={handleUnregister}
          disabled={actionLoading || isPast}
          className="btn btn-red btn-lg"
          style={btnStyle}
        >
          {actionLoading ? <span className="spinner"></span> : '✕ CANCEL REGISTRATION'}
        </button>
      );
    }
    if (isPast) {
      return (
        <button disabled className="btn btn-outline btn-lg" style={btnStyle}>
          EVENT CONCLUDED
        </button>
      );
    }
    if (isFull) {
      return (
        <button disabled className="btn btn-red btn-lg" style={{ ...btnStyle, opacity: 0.7 }}>
          EVENT FULL (0 SEATS)
        </button>
      );
    }
    return (
      <button
        onClick={handleRegister}
        disabled={actionLoading}
        className="btn btn-green btn-lg"
        style={btnStyle}
      >
        {actionLoading ? <span className="spinner"></span> : '🎟️ REGISTER NOW'}
      </button>
    );
  };

  return (
    <div 
      className="container" 
      style={{ 
        paddingTop: 'clamp(1.5rem, 4vw, 3rem)', 
        paddingBottom: 'clamp(5rem, 10vw, 7rem)', 
        maxWidth: 920 
      }}
    >
      {/* Back Link */}
      <Link 
        to="/events" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '0.875rem', 
          color: 'var(--text)', 
          marginBottom: '1.5rem',
          minHeight: 44,
        }}
      >
        <ArrowLeft size={16} /> BACK TO EVENTS
      </Link>

      {/* Main Event Card Panel */}
      <div 
        style={{ 
          border: '2px solid var(--border)', 
          boxShadow: 'var(--shadow-lg)', 
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--surface)',
        }}
      >
        {/* Header Area Tinted Light Blue (#EEF3FE / var(--header-tint)) */}
        <div 
          style={{ 
            backgroundColor: 'var(--header-tint)', 
            padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem)', 
            borderBottom: '2px solid var(--border)',
          }}
        >
          {/* Badge & Registration Status Tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.65rem' }}>
            <span className={`badge ${getCategoryClass(event.category)}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
              {event.category}
            </span>

            {event.isRegistered ? (
              <span className="badge badge-registered" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} /> CONFIRMED ATTENDEE
              </span>
            ) : isFull ? (
              <span className="badge badge-full" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={14} /> EVENT FULL
              </span>
            ) : isPast ? (
              <span className="badge badge-default">CONCLUDED</span>
            ) : (
              <span 
                style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 700, 
                  fontSize: '0.825rem',
                  color: seatsLeftPercentage <= 30 ? 'var(--red)' : 'var(--green)',
                  backgroundColor: 'var(--surface)',
                  padding: '0.3rem 0.65rem',
                  border: '2px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 4,
                }}
              >
                ● {event.seatsLeft} {event.seatsLeft === 1 ? 'SEAT REMAINING' : 'SEATS REMAINING'}
              </span>
            )}
          </div>

          {/* Event Title */}
          <h1 
            style={{ 
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.6rem, 5vw, 2.7rem)', 
              fontWeight: 700, 
              letterSpacing: '-0.02em',
              lineHeight: 1.1, 
              marginBottom: '1rem',
              color: 'var(--text)',
            }}
          >
            {event.title}
          </h1>

          {/* Description in Mono */}
          <p 
            style={{ 
              fontFamily: 'var(--font-mono)',
              color: 'var(--muted)', 
              lineHeight: 1.7, 
              fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', 
              whiteSpace: 'pre-wrap',
            }}
          >
            {event.description}
          </p>
        </div>

        {/* Details & Capacity Section */}
        <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem)' }}>
          {/* Metadata Grid (Stacked list on mobile, grid on tablet/desktop) */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', 
              gap: '1rem', 
              marginBottom: '2rem',
            }}
          >
            <div 
              style={{ 
                padding: '1rem 1.25rem', 
                border: '2px solid var(--border)', 
                boxShadow: 'var(--shadow-sm)',
                borderRadius: 'var(--radius-btn)',
                backgroundColor: 'var(--bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.4rem' }}>
                <Calendar size={14} color="var(--blue)" /> DATE & TIME
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }}>
                {formatDate(event.dateTime)}
              </div>
            </div>

            <div 
              style={{ 
                padding: '1rem 1.25rem', 
                border: '2px solid var(--border)', 
                boxShadow: 'var(--shadow-sm)',
                borderRadius: 'var(--radius-btn)',
                backgroundColor: 'var(--bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.4rem' }}>
                <MapPin size={14} color="var(--red)" /> LOCATION / VENUE
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }}>
                {event.venue}
              </div>
            </div>

            <div 
              style={{ 
                padding: '1rem 1.25rem', 
                border: '2px solid var(--border)', 
                boxShadow: 'var(--shadow-sm)',
                borderRadius: 'var(--radius-btn)',
                backgroundColor: 'var(--bg)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.4rem' }}>
                <Users size={14} color="var(--green)" /> ORGANIZED BY
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }}>
                {event.createdBy?.name || 'GDG RBU Chapter'}
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar with Black Border */}
          <div 
            style={{ 
              padding: '1.25rem', 
              border: '2px solid var(--border)', 
              boxShadow: 'var(--shadow-sm)',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: 'var(--bg)',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                SEAT OCCUPANCY
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.825rem' }}>
                <strong>{event.registeredCount}</strong> / {event.capacity} SEATS BOOKED
              </span>
            </div>

            <div className="progress-bar-container" style={{ height: 16 }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${fillPercentage}%`,
                  backgroundColor: isFull ? 'var(--red)' : seatsLeftPercentage <= 30 ? 'var(--yellow)' : 'var(--green)',
                }}
              />
            </div>
          </div>

          {/* Desktop / Tablet Inline Action Button Section */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderTop: '2px solid var(--border)', 
              paddingTop: '1.75rem', 
              flexWrap: 'wrap', 
              gap: '1rem' 
            }}
          >
            {event.isRegistered ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} /> You hold a confirmed seat for this event.
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.85rem' }}>
                Seats are allocated atomically on first-come, first-served basis.
              </div>
            )}

            <div>
              {renderActionButton(false)}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar (Always reachable on phones < 640px) */}
      <div className="sticky-bottom-bar" role="region" aria-label="Quick registration actions">
        {renderActionButton(true)}
      </div>
    </div>
  );
};
