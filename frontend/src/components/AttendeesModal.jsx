import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const AttendeesModal = ({ event, onClose }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await api.get(`/events/${event.id}/registrations`);
        if (res.data.success) {
          setAttendees(res.data.data);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.error?.message || 'Failed to fetch attendees');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [event.id]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Event Attendees</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{event.title}</p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <span className="spinner"></span>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Loading attendee list...</p>
          </div>
        ) : errorMsg ? (
          <div style={{ color: '#F87171', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
            {errorMsg}
          </div>
        ) : attendees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <p>No users have registered for this event yet.</p>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong>{attendees.length}</strong> confirmed registration{attendees.length === 1 ? '' : 's'}:
            </div>

            <div className="table-container" style={{ maxHeight: 360, overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee, index) => (
                    <tr key={attendee.registrationId || index}>
                      <td>{index + 1}</td>
                      <td style={{ fontWeight: 600 }}>{attendee.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{attendee.email}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {formatDate(attendee.registeredAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
