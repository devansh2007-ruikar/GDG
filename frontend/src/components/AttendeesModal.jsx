import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
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
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: 680,
          border: '3px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 0,
        }}
      >
        <div className="modal-header" style={{ borderBottom: '2px solid var(--border)' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Event Attendees
            </h2>
            <p style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              {event.title}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-outline btn-sm" 
            style={{ padding: '0.25rem 0.5rem' }}
          >
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <span className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }}></span>
            <p style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              Loading attendee list...
            </p>
          </div>
        ) : errorMsg ? (
          <div className="alert-box alert-error" style={{ marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        ) : attendees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
            <p>No members have registered for this event yet.</p>
          </div>
        ) : (
          <div>
            <div 
              style={{ 
                marginBottom: '1rem', 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.85rem', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Users size={16} color="var(--blue)" />
              <span>CONFIRMED GUEST ROSTER ({attendees.length})</span>
            </div>

            <div className="table-container" style={{ maxHeight: 360, overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>REGISTERED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee, index) => (
                    <tr key={attendee.registrationId || index}>
                      <td>{index + 1}</td>
                      <td style={{ fontWeight: 700 }}>{attendee.name}</td>
                      <td style={{ color: 'var(--muted)' }}>{attendee.email}</td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {formatDate(attendee.registeredAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
