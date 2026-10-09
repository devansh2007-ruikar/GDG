import React, { useState, useEffect } from 'react';
import { Printer, X, CheckCircle } from 'lucide-react';
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
        style={{ 
          maxWidth: 480, 
          textAlign: 'center',
          border: '3px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 0,
          padding: '2rem',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--border)' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Digital Admission Pass
            </h2>
            <p style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              OFFICIAL GDG EVENT TICKET
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
          <div style={{ padding: '3.5rem 1.5rem' }}>
            <span className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }}></span>
            <p style={{ marginTop: '1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Generating secure QR pass...
            </p>
          </div>
        ) : errorMsg ? (
          <div className="alert-box alert-error" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontWeight: 700 }}>{errorMsg}</p>
              <button type="button" onClick={onClose} className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                CLOSE
              </button>
            </div>
          </div>
        ) : ticketData && (
          <div>
            <div 
              style={{
                backgroundColor: 'var(--bg)',
                border: '2px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                borderRadius: 0,
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              {/* Category & Title */}
              <div style={{ marginBottom: '1rem' }}>
                <span className="badge badge-tech" style={{ marginBottom: '0.65rem' }}>
                  {ticketData.event.category}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.1, color: 'var(--text)' }}>
                  {ticketData.event.title}
                </h3>
              </div>

              {/* Event Time & Venue in Mono */}
              <div 
                style={{ 
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.825rem', 
                  color: 'var(--text)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.35rem',
                  marginBottom: '1.25rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                }}
              >
                <div>📅 <strong>{formatDate(ticketData.event.dateTime)}</strong></div>
                <div>📍 <strong>{ticketData.event.venue}</strong></div>
              </div>

              {/* QR Code Container with High-Contrast Sharp Border */}
              <div 
                style={{
                  display: 'inline-block',
                  padding: '12px',
                  backgroundColor: '#FFFFFF',
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0 #000000',
                  borderRadius: 0,
                  marginBottom: '1.25rem',
                }}
              >
                <img 
                  src={ticketData.qrCode} 
                  alt="Registration QR Code" 
                  style={{ display: 'block', width: 200, height: 200 }} 
                />
              </div>

              {/* Attendee Info Table */}
              <div 
                style={{ 
                  borderTop: '2px dashed var(--border)', 
                  paddingTop: '1rem', 
                  textAlign: 'left',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.825rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>ATTENDEE:</span>
                  <span style={{ fontWeight: 700 }}>{ticketData.attendee.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>EMAIL:</span>
                  <span style={{ fontWeight: 600 }}>{ticketData.attendee.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>PASS ID:</span>
                  <span style={{ fontWeight: 700, color: 'var(--blue)' }}>
                    {ticketData.registrationId.slice(0, 16)}...
                  </span>
                </div>
              </div>

              {/* Checkmark */}
              <div 
                style={{ 
                  marginTop: '1rem', 
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.785rem', 
                  fontWeight: 700,
                  color: 'var(--green)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.35rem',
                }}
              >
                <CheckCircle size={14} /> VERIFIED PASS • SCAN AT ENTRANCE
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button 
                type="button" 
                onClick={handlePrint} 
                className="btn btn-outline" 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Printer size={16} /> PRINT PASS
              </button>
              <button 
                type="button" 
                onClick={onClose} 
                className="btn btn-yellow" 
                style={{ flex: 1, justifyContent: 'center' }}
              >
                DONE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
