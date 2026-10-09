import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const EventFormModal = ({ event = null, onClose, onSuccess }) => {
  const isEditing = Boolean(event);
  const { success, error } = useToast();

  const toInputDateTime = (isoString) => {
    if (!isoString) {
      // Default to tomorrow 10:00 AM
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      return d.toISOString().slice(0, 16);
    }
    const d = new Date(isoString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    dateTime: toInputDateTime(event?.dateTime),
    venue: event?.venue || '',
    capacity: event?.capacity || 50,
    category: event?.category || 'Tech',
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side validations matching Zod rules
    if (formData.title.trim().length < 3 || formData.title.trim().length > 100) {
      setFormError('Title must be between 3 and 100 characters.');
      return;
    }

    if (formData.description.trim().length < 10 || formData.description.trim().length > 2000) {
      setFormError('Description must be between 10 and 2000 characters.');
      return;
    }

    const eventDate = new Date(formData.dateTime);
    if (isNaN(eventDate.getTime()) || eventDate.getTime() <= Date.now()) {
      setFormError('Date and time must be set in the future.');
      return;
    }

    const capacityInt = parseInt(formData.capacity, 10);
    if (isNaN(capacityInt) || capacityInt < 1 || capacityInt > 10000) {
      setFormError('Capacity must be an integer between 1 and 10,000.');
      return;
    }

    if (isEditing && capacityInt < event.registeredCount) {
      setFormError(`Capacity cannot be reduced below current registered attendees (${event.registeredCount}).`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dateTime: new Date(formData.dateTime).toISOString(),
        venue: formData.venue.trim(),
        capacity: capacityInt,
        category: formData.category.trim(),
      };

      if (isEditing) {
        await api.put(`/events/${event.id}`, payload);
        success('Event updated successfully!');
      } else {
        await api.post('/events', payload);
        success('New event created successfully!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to save event. Check validation requirements.';
      setFormError(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay mobile-fullscreen" onClick={onClose}>
      <div 
        className="modal-content mobile-fullscreen-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: 'min(620px, 94vw)',
          border: '3px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 0,
        }}
      >
        <div className="modal-header modal-fullscreen-header" style={{ borderBottom: '2px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--blue)" />
            <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {isEditing ? 'Edit Event' : 'Create Event'}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-outline btn-sm" 
            style={{ minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-fullscreen-body">
            {formError && (
              <div className="alert-box alert-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">EVENT TITLE (3-100 CHARS)</label>
              <input
                type="text"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Next.js 15 & AI Agents Deep Dive"
                required
              />
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">DOMAIN / CATEGORY</label>
                <select
                  className="select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Tech">Tech</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Meetup">Meetup</option>
                  <option value="Talk">Talk</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">SEAT CAPACITY (1-10,000)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="10000"
                  className="input"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
                {isEditing && (
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginTop: '0.25rem' }}>
                    Current attendees: {event.registeredCount}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">DATE & TIME (FUTURE)</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">VENUE / LOCATION</label>
                <input
                  type="text"
                  className="input"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Auditorium Hall A"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">DESCRIPTION (10-2000 CHARS)</label>
              <textarea
                className="input"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe agenda, topics, speaker bios, and takeaways..."
                required
              />
            </div>
          </div>

          <div className="modal-fullscreen-footer">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={submitting} style={{ minHeight: 44 }}>
              CANCEL
            </button>
            <button type="submit" className="btn btn-green" disabled={submitting} style={{ minHeight: 44 }}>
              {submitting ? <span className="spinner"></span> : isEditing ? 'SAVE CHANGES' : 'PUBLISH EVENT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
