import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading event details...</p>
      </div>
    );
  }

  if (!event) return null;

  const isFull = event.seatsLeft === 0;
  const isPast = new Date(event.dateTime).getTime() <= Date.now();
  const fillPercentage = Math.min(100, (event.registeredCount / event.capacity) * 100);

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

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: 840 }}>
      <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        ← Back to all events
      </Link>

      <div className="card" style={{ padding: '2.5rem' }}>
        {/* Badges & Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="badge badge-tech" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
            {event.category}
          </span>

          {event.isRegistered ? (
            <span className="badge badge-registered">✓ YOU ARE REGISTERED</span>
          ) : isFull ? (
            <span className="badge badge-full">EVENT FULL</span>
          ) : isPast ? (
            <span className="badge badge-default">EVENT CONCLUDED</span>
          ) : (
            <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.9rem' }}>
              ● {event.seatsLeft} {event.seatsLeft === 1 ? 'seat remaining' : 'seats remaining'}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1.25rem' }}>
          {event.title}
        </h1>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ fontSize: '0.785rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Date & Time</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{formatDate(event.dateTime)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.785rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Location / Venue</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{event.venue}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.785rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Organized By</div>
            <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{event.createdBy?.name || 'GDG Chapter'}</div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>About this Event</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
            {event.description}
          </p>
        </div>

        {/* Capacity Breakdown */}
        <div style={{ background: '#0F1626', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 600 }}>Seat Occupancy</span>
            <span style={{ color: 'var(--text-muted)' }}>
              <strong>{event.registeredCount}</strong> / {event.capacity} seats taken
            </span>
          </div>
          <div className="capacity-bar" style={{ height: 8 }}>
            <div
              className="capacity-fill"
              style={{
                width: `${fillPercentage}%`,
                backgroundColor: isFull ? '#EF4444' : fillPercentage > 80 ? '#F59E0B' : '#3B82F6',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
            <span>0 seats</span>
            <span>{event.capacity} total capacity</span>
          </div>
        </div>

        {/* Action Button Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          {!user ? (
            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%', textAlign: 'center' }}>
              🔑 Login to Register
            </Link>
          ) : event.isRegistered ? (
            <button
              onClick={handleUnregister}
              disabled={actionLoading || isPast}
              className="btn btn-danger btn-lg"
              style={{ minWidth: 200 }}
            >
              {actionLoading ? <span className="spinner"></span> : '✕ Unregister from Event'}
            </button>
          ) : isPast ? (
            <button disabled className="btn btn-secondary btn-lg" style={{ minWidth: 200 }}>
              Event Already Concluded
            </button>
          ) : isFull ? (
            <button disabled className="btn btn-secondary btn-lg" style={{ minWidth: 200 }}>
              Event Full (0 Seats Left)
            </button>
          ) : (
            <button
              onClick={handleRegister}
              disabled={actionLoading}
              className="btn btn-primary btn-lg"
              style={{ minWidth: 200 }}
            >
              {actionLoading ? <span className="spinner"></span> : '🎟️ Register Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
