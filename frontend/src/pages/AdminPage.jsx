import React, { useState, useEffect } from 'react';
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
      setEvents((prev) => prev.filter((e) => e.id !== id));
      fetchAnalytics();
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
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Event Administration & Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Real-time platform insights, event capacities, and attendee management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={refreshData} className="btn btn-secondary" title="Refresh data">
            🔄 Refresh
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            + Create New Event
          </button>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', padding: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)' }}>
            📅
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Events
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {analyticsLoading ? '...' : analytics?.totalEvents ?? 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              Created across categories
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', padding: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)' }}>
            👥
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Attendees
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {analyticsLoading ? '...' : analytics?.totalUsers ?? 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              Registered user members
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ fontSize: '2rem', padding: '0.8rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius-md)' }}>
            🎟️
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Registrations
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {analyticsLoading ? '...' : analytics?.totalRegistrations ?? 0}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
              Confirmed event bookings
            </div>
          </div>
        </div>
      </div>

      {/* Fill Rate & Category Breakdown */}
      {analytics && (
        <div className="grid grid-cols-2" style={{ marginBottom: '2.5rem' }}>
          {/* Top 5 Events by Fill Rate */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔥 Top Events by Fill Rate
            </h3>
            {analytics.topEvents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No events recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {analytics.topEvents.map((e) => (
                  <div key={e.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{e.title}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {e.registeredCount} / {e.capacity} ({e.fillPercentage}%)
                      </span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, e.fillPercentage)}%`,
                          background: e.fillPercentage >= 100 ? '#EF4444' : 'var(--primary)',
                          borderRadius: 4,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registrations per Category */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Registrations per Category
            </h3>
            {analytics.registrationsByCategory.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No registrations recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analytics.registrationsByCategory.map((c) => (
                  <div
                    key={c.category}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <span className="badge badge-tech">{c.category}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {c.count} {c.count === 1 ? 'attendee' : 'attendees'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Management Table Header */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Events Directory</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></span>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading event records...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>No events exist in the system yet.</p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            Create First Event
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Category</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Capacity (Filled / Max)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const isFull = event.registeredCount >= event.capacity;
                return (
                  <tr key={event.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{event.title}</div>
                      <div style={{ fontSize: '0.785rem', color: 'var(--text-dim)' }}>ID: {event.id.slice(0, 8)}...</div>
                    </td>
                    <td>
                      <span className="badge badge-tech">{event.category}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{formatDate(event.dateTime)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{event.venue}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: isFull ? '#EF4444' : 'var(--text-main)' }}>
                          {event.registeredCount} / {event.capacity}
                        </span>
                        {isFull && <span className="badge badge-full" style={{ fontSize: '0.65rem' }}>FULL</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => setSelectedEventForAttendees(event)}
                          className="btn btn-secondary btn-sm"
                          title="View Attendees"
                        >
                          👥 Attendees ({event.registeredCount})
                        </button>
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Event"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          className="btn btn-danger btn-sm"
                          title="Delete Event"
                        >
                          🗑️
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
