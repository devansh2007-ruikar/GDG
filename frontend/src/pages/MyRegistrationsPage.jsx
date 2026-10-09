import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { QrTicketModal } from '../components/QrTicketModal';

export const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [selectedQrTicket, setSelectedQrTicket] = useState(null);
  const { success, error } = useToast();

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/me/registrations');
      if (res.data.success) {
        setRegistrations(res.data.data);
      }
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to load your registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleUnregister = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to cancel your seat for "${title}"?`)) {
      return;
    }

    setActionId(eventId);
    try {
      await api.delete(`/events/${eventId}/register`);
      success(`Cancelled registration for "${title}"`);
      // Update state
      setRegistrations((prev) => prev.filter((r) => r.event.id !== eventId));
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to unregister');
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const now = Date.now();
  const upcoming = registrations.filter((r) => new Date(r.event.dateTime).getTime() > now);
  const past = registrations.filter((r) => new Date(r.event.dateTime).getTime() <= now);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your registered events...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          My Event Registrations
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your upcoming passes and review events you've previously attended.
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟️</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No registrations yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
            You haven't signed up for any GDG events yet. Discover upcoming talks, workshops, and meetups!
          </p>
          <Link to="/events" className="btn btn-primary">
            Explore Events →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Upcoming Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Upcoming Events</h2>
              <span className="badge badge-tech">{upcoming.length}</span>
            </div>

            {upcoming.length === 0 ? (
              <div className="card" style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                You have no upcoming events scheduled. <Link to="/events" style={{ color: 'var(--primary)', fontWeight: 600 }}>Find an event</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2">
                {upcoming.map((reg) => (
                  <div key={reg.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-tech">{reg.event.category}</span>
                      <span className="badge badge-registered">CONFIRMED SEAT</span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                      <Link to={`/events/${reg.event.id}`} style={{ color: 'inherit' }}>
                        {reg.event.title}
                      </Link>
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div>📅 {formatDate(reg.event.dateTime)}</div>
                      <div>📍 {reg.event.venue}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                      <button
                        onClick={() => setSelectedQrTicket(reg)}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                      >
                        🎟️ View QR Pass
                      </button>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <Link to={`/events/${reg.event.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                          Details
                        </Link>
                        <button
                          onClick={() => handleUnregister(reg.event.id, reg.event.title)}
                          disabled={actionId === reg.event.id}
                          className="btn btn-danger btn-sm"
                          style={{ flex: 1 }}
                        >
                          {actionId === reg.event.id ? <span className="spinner"></span> : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-muted)' }}>Past Events</h2>
              <span className="badge badge-default">{past.length}</span>
            </div>

            {past.length === 0 ? (
              <div className="card" style={{ padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                No past event history recorded.
              </div>
            ) : (
              <div className="grid grid-cols-2">
                {past.map((reg) => (
                  <div key={reg.id} className="card" style={{ opacity: 0.75, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-default">{reg.event.category}</span>
                      <span className="badge badge-default">ATTENDED</span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{reg.event.title}</h3>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
                      Concluded on {formatDate(reg.event.dateTime)} • {reg.event.venue}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {selectedQrTicket && (
        <QrTicketModal
          registration={selectedQrTicket}
          onClose={() => setSelectedQrTicket(null)}
        />
      )}
    </div>
  );
};
