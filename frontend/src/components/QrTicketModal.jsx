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
          maxWidth: 'min(480px, 94vw)', 
          textAlign: 'center',
          border: '2px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 0,
          padding: 'clamp(1.25rem, 4vw, 2rem)',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '1.25rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.85rem' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Digital Admission Pass
            </h2>
            <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              OFFICIAL GDG EVENT TICKET
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-outline" 
            style={{ minWidth: 44, minHeight: 44, padding: 0 }}
            aria-label="Close ticket pass"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem 1rem' }}>
            <span className="spinner" style={{ width: 40, height: 40, borderWidth: 4 }}></span>
            <p style={{ marginTop: '1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Generating secure QR pass...
            </p>
          </div>
        ) : errorMsg ? (
          <div className="alert-box alert-error" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontWeight: 700 }}>{errorMsg}</p>
              <button type="button" onClick={onClose} className="btn btn-outline" style={{ marginTop: '0.75rem', minHeight: 44 }}>
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
                padding: 'clamp(1rem, 3vw, 1.5rem)',
                marginBottom: '1.25rem',
              }}
            >
              {/* Category & Title */}
              <div style={{ marginBottom: '0.85rem' }}>
                <span className="badge badge-tech" style={{ marginBottom: '0.5rem' }}>
                  {ticketData.event.category}
                </span>
                <h3 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.4rem)', fontWeight: 700, lineHeight: 1.1, color: 'var(--text)' }}>
                  {ticketData.event.title}
                </h3>
              </div>

              {/* Event Time & Venue in Mono */}
              <div 
                style={{ 
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem', 
                  color: 'var(--text)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.35rem',
                  marginBottom: '1rem',
                  padding: '0.65rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  textAlign: 'left',
                }}
              >
                <div>📅 <strong>{formatDate(ticketData.event.dateTime)}</strong></div>
                <div>📍 <strong>{ticketData.event.venue}</strong></div>
              </div>

              {/* QR Code Container with High-Contrast Sharp Border (Max 70vw) */}
              <div 
                style={{
                  display: 'inline-block',
                  padding: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #000000',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 0,
                  marginBottom: '1rem',
                  maxWidth: '100%',
                }}
              >
                <img 
                  src={ticketData.qrCode} 
                  alt="Registration QR Code" 
                  style={{ 
                    display: 'block', 
                    width: 'min(190px, 65vw)', 
                    height: 'min(190px, 65vw)',
                    maxWidth: '100%',
                    aspectRatio: '1/1',
                  }} 
                />
              </div>

              {/* Attendee Info Table */}
              <div 
                style={{ 
                  borderTop: '2px dashed var(--border)', 
                  paddingTop: '0.85rem', 
                  textAlign: 'left',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  wordBreak: 'break-word',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--muted)' }}>ATTENDEE:</span>
                  <span style={{ fontWeight: 700 }}>{ticketData.attendee.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--muted)' }}>EMAIL:</span>
                  <span style={{ fontWeight: 600 }}>{ticketData.attendee.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--muted)' }}>PASS ID:</span>
                  <span style={{ fontWeight: 700, color: 'var(--blue)' }}>
                    {ticketData.registrationId.slice(0, 14)}...
                  </span>
                </div>
              </div>

              {/* Checkmark */}
              <div 
                style={{ 
                  marginTop: '0.85rem', 
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem', 
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
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                onClick={handlePrint} 
                className="btn btn-outline" 
                style={{ flex: '1 1 min(100%, 140px)', minHeight: 44, justifyContent: 'center' }}
              >
                <Printer size={16} /> PRINT PASS
              </button>
              <button 
                type="button" 
                onClick={onClose} 
                className="btn btn-yellow" 
                style={{ flex: '1 1 min(100%, 140px)', minHeight: 44, justifyContent: 'center' }}
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
