import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, QrCode, ArrowRight, Trash2, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const now = Date.now();
  const upcoming = registrations.filter((r) => new Date(r.event.dateTime).getTime() > now);
  const past = registrations.filter((r) => new Date(r.event.dateTime).getTime() <= now);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="spinner" style={{ width: 44, height: 44, borderWidth: 4 }}></div>
        <p style={{ marginTop: '1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          Loading your registered event passes...
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.75rem' }}>
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            backgroundColor: 'var(--blue)', 
            color: '#000000', 
            border: '2px solid var(--border)', 
            boxShadow: 'var(--shadow-sm)', 
            padding: '0.35rem 0.95rem', 
            borderRadius: 'var(--radius-pill)', 
            fontFamily: 'var(--font-mono)',
            fontWeight: 800, 
            fontSize: '0.785rem', 
            letterSpacing: '0.08em', 
            marginBottom: '1rem',
          }}
        >
          <Ticket size={14} /> ATTENDEE PORTAL
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          MY REGISTRATIONS
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '1.05rem' }}>
          Manage your upcoming passes, generate admission QR codes, and review past events.
        </p>
      </div>

      {registrations.length === 0 ? (
        <div 
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '4.5rem 1.5rem',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 0,
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎟️</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            NO ACTIVE RESERVATIONS
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            You haven't reserved a seat for any upcoming GDG sessions yet.
          </p>
          <Link to="/events" className="btn btn-yellow btn-lg">
            EXPLORE EVENTS →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Upcoming Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>UPCOMING EVENTS</h2>
              <span className="badge badge-tech">{upcoming.length}</span>
            </div>

            {upcoming.length === 0 ? (
              <div 
                className="card" 
                style={{ 
                  padding: '1.75rem', 
                  fontFamily: 'var(--font-mono)', 
                  color: 'var(--muted)',
                  border: '2px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 0,
                }}
              >
                No upcoming events scheduled. <Link to="/events" style={{ color: 'var(--blue)', fontWeight: 700 }}>Find an event to attend →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2">
                {upcoming.map((reg) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="card card-interactive"
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      border: '2px solid var(--border)',
                      boxShadow: 'var(--shadow-lg)',
                      borderRadius: 0,
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="badge badge-tech">{reg.event.category}</span>
                      <span className="badge badge-registered">CONFIRMED SEAT</span>
                    </div>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0.35rem 0' }}>
                      <Link to={`/events/${reg.event.id}`} style={{ color: 'inherit' }}>
                        {reg.event.title}
                      </Link>
                    </h3>

                    <div 
                      style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.85rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.4rem',
                        padding: '0.75rem',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-btn)',
                        backgroundColor: 'var(--bg)',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Calendar size={14} color="var(--blue)" />
                        <span style={{ fontWeight: 600 }}>{formatDate(reg.event.dateTime)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <MapPin size={14} color="var(--red)" />
                        <span>{reg.event.venue}</span>
                      </div>
                    </div>

                    {/* Brutalist Button Controls */}
                    <div 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.65rem', 
                        marginTop: 'auto', 
                        paddingTop: '0.85rem', 
                        borderTop: '2px solid var(--border)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedQrTicket(reg)}
                        className="btn btn-yellow"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <QrCode size={16} /> VIEW QR ADMISSION PASS
                      </button>

                      <div style={{ display: 'flex', gap: '0.65rem' }}>
                        <Link 
                          to={`/events/${reg.event.id}`} 
                          className="btn btn-outline" 
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          DETAILS <ArrowRight size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleUnregister(reg.event.id, reg.event.title)}
                          disabled={actionId === reg.event.id}
                          className="btn btn-red"
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          {actionId === reg.event.id ? <span className="spinner"></span> : <><Trash2 size={14} /> CANCEL</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Past Section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--muted)' }}>PAST ATTENDED EVENTS</h2>
              <span className="badge badge-default">{past.length}</span>
            </div>

            {past.length === 0 ? (
              <div 
                className="card" 
                style={{ 
                  padding: '1.5rem', 
                  fontFamily: 'var(--font-mono)', 
                  color: 'var(--muted)',
                  border: '2px solid var(--border)',
                  borderRadius: 0,
                }}
              >
                No past event attendance recorded.
              </div>
            ) : (
              <div className="grid grid-cols-2">
                {past.map((reg) => (
                  <div 
                    key={reg.id} 
                    className="card" 
                    style={{ 
                      opacity: 0.8, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.5rem',
                      border: '2px solid var(--border)',
                      borderRadius: 0,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-default">{reg.event.category}</span>
                      <span className="badge badge-default">ATTENDED</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{reg.event.title}</h3>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--muted)' }}>
                      Concluded on {formatDate(reg.event.dateTime)} • {reg.event.venue}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* QR Ticket Modal */}
      {selectedQrTicket && (
        <QrTicketModal
          registration={selectedQrTicket}
          onClose={() => setSelectedQrTicket(null)}
        />
      )}
    </div>
  );
};
