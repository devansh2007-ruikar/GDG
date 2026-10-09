import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const QrTicketModal = ({ registration, onClose }) => {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const res = await api.get(`/registrations/${registration.id}/qr`);
        if (res.data.success) {
          setTicketData(res.data.data);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.error?.message || 'Failed to generate ticket QR code');
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, [registration.id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content print-ticket-area" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 460, textAlign: 'center' }}
      >
        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
              Digital Event Ticket
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Official admission pass
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-secondary btn-sm" 
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.9rem' }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem 1.5rem' }}>
            <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}></span>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Generating secure QR pass...
            </p>
          </div>
        ) : errorMsg ? (
          <div style={{ color: '#F87171', padding: '1.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: 12 }}>
            <p style={{ fontWeight: 600 }}>{errorMsg}</p>
            <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
              Close
            </button>
          </div>
        ) : ticketData && (
          <div>
            <div 
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Event Badge & Title */}
              <div style={{ marginBottom: '1rem' }}>
                <span className="badge badge-tech" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  {ticketData.event.category}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                  {ticketData.event.title}
                </h3>
              </div>

              {/* Event Details */}
              <div 
                style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.35rem',
                  marginBottom: '1.25rem',
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>📅 <strong>{formatDate(ticketData.event.dateTime)}</strong></div>
                <div>📍 <strong>{ticketData.event.venue}</strong></div>
              </div>

              {/* QR Code */}
              <div 
                style={{
                  display: 'inline-block',
                  padding: '12px',
                  background: '#FFFFFF',
                  borderRadius: 16,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  marginBottom: '1rem',
                }}
              >
                <img 
                  src={ticketData.qrCode} 
                  alt="Registration QR Code" 
                  style={{ display: 'block', width: 200, height: 200 }} 
                />
              </div>

              {/* Attendee & Verification Info */}
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Attendee:</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {ticketData.attendee.name}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Email:</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {ticketData.attendee.email}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Ticket ID:</span>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                    {ticketData.registrationId.slice(0, 18)}...
                  </span>
                </div>
              </div>

              <div 
                style={{ 
                  marginTop: '1rem', 
                  fontSize: '0.75rem', 
                  color: 'var(--accent-green)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.35rem' 
                }}
              >
                <span>✓</span> Verified Ticket Pass • Present for Entry
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button 
                type="button" 
                onClick={handlePrint} 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                🖨️ Print Ticket
              </button>
              <button 
                type="button" 
                onClick={onClose} 
                className="btn btn-primary" 
                style={{ flex: 1 }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
