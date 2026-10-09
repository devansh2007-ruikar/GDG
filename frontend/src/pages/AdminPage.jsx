import React, { useState, useEffect } from 'react';
import { Plus, RotateCcw, Calendar, Users, Ticket, Flame, BarChart3, Edit, Trash2, Clock, UserCheck } from 'lucide-react';
import api from '../services/api';
import { AttendeesModal } from '../components/AttendeesModal';
import { EventFormModal } from '../components/EventFormModal';
import { useToast } from '../context/ToastContext';

export const AdminPage = () => {
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { success, error } = useToast();

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events', {
        params: { limit: 50, upcoming: 'false' },
      });
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to fetch admin events');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchEvents();
    fetchAnalytics();
  };

  useEffect(() => {
    fetchEvents();
    fetchAnalytics();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? All existing attendee registrations will be cascade-deleted.`)) {
      return;
    }

    try {
      await api.delete(`/events/${id}`);
      success(`Event "${title}" successfully deleted`);
      refreshData();
    } catch (err) {
      error(err.response?.data?.error?.message || 'Failed to delete event');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Admin Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2.5rem', 
          flexWrap: 'wrap', 
          gap: '1.25rem',
        }}
      >
        <div>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              backgroundColor: 'var(--green)', 
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
            🛡️ GDG RBU • COMMAND CENTER
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.4rem', lineHeight: 1.1 }}>
            Event Administration
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '1.05rem' }}>
            Live platform metrics, capacity tracking, and attendee roster management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={refreshData} className="btn btn-outline" title="Refresh data">
            <RotateCcw size={16} /> REFRESH
          </button>
          <button type="button" onClick={() => setShowCreateModal(true)} className="btn btn-green">
            <Plus size={16} /> CREATE NEW EVENT
          </button>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
          gap: '1.25rem', 
          marginBottom: '2.5rem' 
        }}
      >
        {/* 1. Total Events */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '1.25rem',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 0,
          }}
        >
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              minWidth: 48,
              backgroundColor: 'var(--blue)', 
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-btn)',
              boxShadow: '2px 2px 0 var(--border)',
              color: '#000',
            }}
          >
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              TOTAL EVENTS
            </div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, lineHeight: 1.1 }}>
              {analyticsLoading ? '...' : analytics?.totalEvents ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              Published on platform
            </div>
          </div>
        </div>

        {/* 2. Upcoming Events */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '1.25rem',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 0,
          }}
        >
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              minWidth: 48,
              backgroundColor: 'var(--purple)', 
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-btn)',
              boxShadow: '2px 2px 0 var(--border)',
              color: '#000',
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              UPCOMING EVENTS
            </div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, lineHeight: 1.1 }}>
              {analyticsLoading ? '...' : analytics?.upcomingEvents ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              Scheduled in future
            </div>
          </div>
        </div>

        {/* 3. Registered Users */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '1.25rem',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 0,
          }}
        >
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              minWidth: 48,
              backgroundColor: 'var(--yellow)', 
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-btn)',
              boxShadow: '2px 2px 0 var(--border)',
              color: '#000',
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              REGISTERED USERS
            </div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, lineHeight: 1.1 }}>
              {analyticsLoading ? '...' : analytics?.registeredUsers ?? analytics?.totalUsers ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              Accounts with USER role
            </div>
          </div>
        </div>

        {/* 4. Total Bookings */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '1.25rem',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 0,
          }}
        >
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              minWidth: 48,
              backgroundColor: 'var(--green)', 
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-btn)',
              boxShadow: '2px 2px 0 var(--border)',
              color: '#000',
            }}
          >
            <Ticket size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              TOTAL BOOKINGS
            </div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, lineHeight: 1.1 }}>
              {analyticsLoading ? '...' : analytics?.totalBookings ?? analytics?.totalRegistrations ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              Confirmed seat rows
            </div>
          </div>
        </div>

        {/* 5. Unique Attendees */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '1.25rem',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 0,
          }}
        >
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              minWidth: 48,
              backgroundColor: 'var(--blue)', 
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-btn)',
              boxShadow: '2px 2px 0 var(--border)',
              color: '#000',
            }}
          >
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              UNIQUE ATTENDEES
            </div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, lineHeight: 1.1 }}>
              {analyticsLoading ? '...' : analytics?.uniqueAttendees ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              Distinct users with ≥1 seat
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      {analytics && (
        <div className="grid grid-cols-2" style={{ marginBottom: '3rem' }}>
          {/* Top 5 Events by Fill Rate */}
          <div 
            className="card" 
            style={{ 
              padding: '1.75rem',
              border: '2px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              borderRadius: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Flame size={20} color="var(--red)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.1 }}>Top Events by Fill Rate</h2>
            </div>

            {analytics.topEvents.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.9rem' }}>
                No events recorded yet.
              </p>
            ) : (analytics.totalBookings ?? analytics.totalRegistrations ?? 0) === 0 ? (
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.9rem' }}>
                No registrations yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {analytics.topEvents.map((e) => (
                  <div key={e.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700 }}>{e.title}</span>
                      <span style={{ color: 'var(--muted)' }}>
                        {e.registeredCount} / {e.capacity} ({e.fillPercentage}%)
                      </span>
                    </div>

                    <div className="progress-bar-container" style={{ height: 12 }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(100, e.fillPercentage)}%`,
                          backgroundColor: e.fillPercentage >= 100 ? 'var(--red)' : e.fillPercentage >= 70 ? 'var(--yellow)' : 'var(--blue)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registrations per Category */}
          <div 
            className="card" 
            style={{ 
              padding: '1.75rem',
              border: '2px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              borderRadius: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <BarChart3 size={20} color="var(--blue)" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.1 }}>Registrations by Domain</h2>
            </div>

            {analytics.registrationsByCategory.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.9rem' }}>
                No categories recorded yet.
              </p>
            ) : (analytics.totalBookings ?? analytics.totalRegistrations ?? 0) === 0 ? (
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  No registrations yet.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analytics.registrationsByCategory.map((c) => (
                    <div
                      key={c.category}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg)',
                        border: '2px solid var(--border)',
                        borderRadius: 'var(--radius-btn)',
                        boxShadow: '2px 2px 0 var(--border)',
                      }}
                    >
                      <span className="badge badge-tech">{c.category}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--muted)' }}>
                        0 ATTENDEES
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {analytics.registrationsByCategory.map((c) => (
                  <div
                    key={c.category}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--bg)',
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--radius-btn)',
                      boxShadow: '2px 2px 0 var(--border)',
                    }}
                  >
                    <span className="badge badge-tech">{c.category}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem' }}>
                      {c.count} {c.count === 1 ? 'ATTENDEE' : 'ATTENDEES'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Directory Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.1 }}>Events Directory</h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--muted)' }}>
          {events.length} TOTAL MANAGED
        </span>
      </div>

      {/* Directory Table with Yellow Header */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <img
            src="/gdg-logo.svg"
            alt="GDG RBU logo"
            width="72"
            height="38"
            className="gdg-logo"
            style={{ marginBottom: '1.25rem', opacity: 0.95 }}
          />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span className="spinner" style={{ width: 34, height: 34, borderWidth: 3 }}></span>
          </div>
          <p style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            Loading event records...
          </p>
        </div>
      ) : events.length === 0 ? (
        <div 
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '3.5rem 1.5rem',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 0,
          }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '1.25rem' }}>
            No events exist in the database.
          </p>
          <button type="button" onClick={() => setShowCreateModal(true)} className="btn btn-green">
            CREATE FIRST EVENT
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>EVENT TITLE</th>
                <th>CATEGORY</th>
                <th>DATE & TIME</th>
                <th>VENUE</th>
                <th>SEATS (FILLED / MAX)</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const isFull = event.registeredCount >= event.capacity;
                return (
                  <tr key={event.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{event.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        ID: {event.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-tech">{event.category}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatDate(event.dateTime)}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {event.venue}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: isFull ? 'var(--red)' : 'var(--text)' }}>
                          {event.registeredCount} / {event.capacity}
                        </span>
                        {isFull && <span className="badge badge-full" style={{ fontSize: '0.65rem' }}>FULL</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.45rem' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedEventForAttendees(event)}
                          className="btn btn-outline btn-sm"
                          title="View attendee roster"
                        >
                          <Users size={14} /> ({event.registeredCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingEvent(event)}
                          className="btn btn-yellow btn-sm"
                          title="Edit event"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(event.id, event.title)}
                          className="btn btn-red btn-sm"
                          title="Delete event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Attendees Modal */}
      {selectedEventForAttendees && (
        <AttendeesModal
          event={selectedEventForAttendees}
          onClose={() => setSelectedEventForAttendees(null)}
        />
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <EventFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={refreshData}
        />
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <EventFormModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
};
