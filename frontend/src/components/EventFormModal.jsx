import React, { useState } from 'react';
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem' }}>
            ✕
          </button>
        </div>

        {formError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
          }}>
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Event Title (3-100 characters)</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Next.js 15 & AI Agents Workshop"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
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
              <label className="form-label">Capacity (Seats: 1-10,000)</label>
              <input
                type="number"
                min="1"
                max="10000"
                className="input"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
              {isEditing && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                  Current attendees: {event.registeredCount}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date & Time (Must be in future)</label>
              <input
                type="datetime-local"
                className="input"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Venue / Location</label>
              <input
                type="text"
                className="input"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Hall 4, Tech Innovation Center"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (10-2000 characters)</label>
            <textarea
              className="textarea"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the agenda, prerequisites, target audience, and highlights..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner"></span> : isEditing ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
