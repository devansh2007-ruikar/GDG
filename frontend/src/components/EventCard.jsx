import React from 'react';
import { Link } from 'react-router-dom';

export const EventCard = ({ event }) => {
  const isFull = event.seatsLeft === 0;
  const isPast = new Date(event.dateTime).getTime() <= Date.now();
  const fillPercentage = Math.min(100, (event.registeredCount / event.capacity) * 100);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'tech': return 'badge-tech';
      case 'workshop': return 'badge-workshop';
      case 'hackathon': return 'badge-hackathon';
      case 'meetup': return 'badge-meetup';
      case 'talk': return 'badge-talk';
      default: return 'badge-default';
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <span className={`badge ${getCategoryClass(event.category)}`}>
          {event.category}
        </span>
        {isFull ? (
          <span className="badge badge-full">EVENT FULL</span>
        ) : isPast ? (
          <span className="badge badge-default">CONCLUDED</span>
        ) : (
          <span style={{ fontSize: '0.785rem', color: '#10B981', fontWeight: 600 }}>
            {event.seatsLeft} {event.seatsLeft === 1 ? 'seat left' : 'seats left'}
          </span>
        )}
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem', lineHeight: 1.3 }}>
        {event.title}
      </h3>

      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        marginBottom: '1rem',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1
      }}>
        {event.description}
      </p>

      <div style={{ fontSize: '0.825rem', color: 'var(--text-dim)', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <span>📅</span>
          <span>{formatDate(event.dateTime)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <span>📍</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.venue}</span>
        </div>
      </div>

      {/* Capacity Progress Bar */}
      <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <span>Capacity</span>
          <span>{event.registeredCount} / {event.capacity} seats</span>
        </div>
        <div className="capacity-bar">
          <div
            className="capacity-fill"
            style={{
              width: `${fillPercentage}%`,
              backgroundColor: isFull ? '#EF4444' : fillPercentage > 75 ? '#F59E0B' : '#3B82F6',
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Link to={`/events/${event.id}`} className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
          View Details →
        </Link>
      </div>
    </div>
  );
};
