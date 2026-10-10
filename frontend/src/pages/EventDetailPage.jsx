import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EventDetailSkeleton } from '../components/EventDetailSkeleton';
import { formatDateTimeIST } from '../utils/date';

export const EventDetailPage = () => {
  const { id } = useParams();
  const { user, authLoading } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        if (res.data.success && isMounted) {
          setEvent(res.data.data);
        }
      } catch (err) {
        if (isMounted) {
          error(err.response?.data?.error?.message || 'Event not found');
          navigate('/events');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEvent();
    return () => {
      isMounted = false;
    };
  }, [id, error, navigate]);

  if (loading && !event) {
    return <EventDetailSkeleton />;
  }

  if (!event) return null;

  const isFull = event.seatsLeft === 0;
  const isPast = new Date(event.dateTime).getTime() <= Date.now();
  const fillPercentage = Math.min(100, (event.registeredCount / event.capacity) * 100);
  const seatsLeftPercentage = (event.seatsLeft / event.capacity) * 100;

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

  /**
   * Action button renderer for both desktop inline and mobile sticky bottom bar
   */
  const renderActionButton = (isMobileBar = false) => {
    const baseStyle = isMobileBar
      ? { minHeight: 44, padding: '0.6rem 1.15rem', fontSize: '0.9rem', flexShrink: 0 }
      : { minWidth: 220, minHeight: 48, fontSize: '0.95rem' };

    if (authLoading) {
      return (
        <div
          style={{
            ...baseStyle,
            backgroundColor: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-btn)',
            opacity: 0.6,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="spinner" style={{ width: 18, height: 18 }} />
        </div>
      );
    }

    if (!user) {
      return (
        <Link
          to="/login"
          state={{ from: location }}
          className="btn btn-primary"
          style={baseStyle}
        >
          Login to Register
        </Link>
      );
    }

    if (isPast) {
      return (
        <button disabled className="btn btn-outline" style={{ ...baseStyle, opacity: 0.6 }}>
          Event Ended
        </button>
      );
    }

    if (event.isRegistered) {
      return (
        <button
          onClick={handleUnregister}
          disabled={actionLoading}
          className="btn btn-red"
          style={baseStyle}
        >
          {actionLoading ? <span className="spinner"></span> : 'Unregister'}
        </button>
      );
    }

    if (isFull) {
      return (
        <button disabled className="btn btn-red" style={{ ...baseStyle, opacity: 0.7 }}>
          Event Full
        </button>
      );
    }

    return (
      <button
        onClick={handleRegister}
        disabled={actionLoading}
        className="btn btn-green"
        style={baseStyle}
      >
        {actionLoading ? <span className="spinner"></span> : 'Register'}
      </button>
    );
  };

  return (
    <div 
      className="container event-detail-container" 
      style={{ 
        paddingTop: 'clamp(1.5rem, 4vw, 3rem)', 
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
          marginBottom: '1.25rem',
          minHeight: 44,
          touchAction: 'manipulation',
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
            padding: 'clamp(1.25rem, 4vw, 2.25rem) clamp(1rem, 3vw, 2rem)', 
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
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', 
              fontWeight: 700, 
              letterSpacing: '-0.02em',
              lineHeight: 1.15, 
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
              lineHeight: 1.65, 
              fontSize: 'clamp(0.9rem, 2.5vw, 1rem)', 
              whiteSpace: 'pre-wrap',
            }}
          >
            {event.description}
          </p>
        </div>

        {/* Details & Capacity Section */}
        <div style={{ padding: 'clamp(1.25rem, 4vw, 2.25rem) clamp(1rem, 3vw, 2rem)' }}>
          {/* Metadata Grid (Stacked on mobile, grid on tablet/desktop) */}
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
                <Calendar size={14} color="var(--blue)" /> DATE & TIME (IST)
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem' }}>
                {formatDateTimeIST(event.dateTime, { includeYear: true, weekday: 'long' })}
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

          {/* Capacity Progress Bar */}
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

          {/* Desktop Inline Action Button Section (Hidden on mobile <768px to prevent duplicate buttons) */}
          <div 
            className="inline-action-desktop"
            style={{ 
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

      {/* Mobile Sticky Bottom Bar (Visible ONLY on mobile < 768px) */}
      <div className="sticky-bottom-bar" role="region" aria-label="Quick registration actions">
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span 
            style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem', 
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: isFull || isPast ? 'var(--muted)' : seatsLeftPercentage <= 30 ? 'var(--red)' : 'var(--green)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {event.isRegistered ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--green)' }}>
                <CheckCircle2 size={13} /> CONFIRMED ATTENDEE
              </span>
            ) : isPast ? (
              'EVENT CONCLUDED'
            ) : isFull ? (
              'EVENT FULL (0 SEATS)'
            ) : (
              `● ${event.seatsLeft} ${event.seatsLeft === 1 ? 'SEAT' : 'SEATS'} LEFT`
            )}
          </span>
          <span 
            style={{ 
              fontFamily: 'var(--font-heading)', 
              fontWeight: 700, 
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'var(--text)',
            }}
          >
            {event.title}
          </span>
        </div>

        {renderActionButton(true)}
      </div>
    </div>
  );
};
