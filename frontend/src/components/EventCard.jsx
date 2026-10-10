import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateTimeIST } from '../utils/date';

export const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const isFull = event.seatsLeft === 0;
  const isPast = new Date(event.dateTime).getTime() <= Date.now();
  const fillPercentage = Math.min(100, (event.registeredCount / event.capacity) * 100);
  const seatsLeftPercentage = (event.seatsLeft / event.capacity) * 100;

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

  const getProgressColor = () => {
    if (isFull) return 'var(--red)';
    if (seatsLeftPercentage <= 30) return 'var(--yellow)';
    return 'var(--green)';
  };

  const handleCardClick = (e) => {
    // Avoid double navigation if user tapped directly on the Link or button
    if (e.target.closest('a, button')) return;
    navigate(`/events/${event.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={handleCardClick}
      className="card card-interactive event-card-mobile"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        cursor: 'pointer',
      }}
      role="article"
      aria-label={`Event: ${event.title}`}
    >
      {/* Category Tag & Seat Indicator on One Compact Row */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '0.75rem', 
          flexWrap: 'nowrap', 
          gap: '0.5rem' 
        }}
      >
        <span className={`badge ${getCategoryClass(event.category)}`}>
          {event.category}
        </span>

        {isFull ? (
          <span className="badge badge-full">EVENT FULL</span>
        ) : isPast ? (
          <span className="badge badge-default">CONCLUDED</span>
        ) : (
          <span 
            className={`seat-indicator ${seatsLeftPercentage <= 30 ? 'seat-indicator-urgent' : 'seat-indicator-normal'}`}
          >
            {event.seatsLeft} {event.seatsLeft === 1 ? 'SEAT LEFT' : 'SEATS LEFT'}
          </span>
        )}
      </div>

      {/* Card Title */}
      <h2 
        style={{ 
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.15rem, 3.5vw, 1.35rem)', 
          fontWeight: 700, 
          letterSpacing: '-0.02em', 
          marginBottom: '0.5rem', 
          lineHeight: 1.2,
        }}
      >
        <Link 
          to={`/events/${event.id}`} 
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          {event.title}
        </Link>
      </h2>

      {/* Description in Mono */}
      <p 
        style={{
          fontSize: '0.85rem',
          color: 'var(--muted)',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
          lineHeight: 1.5,
        }}
      >
        {event.description}
      </p>

      {/* Event Meta with Icons (IST Timezone) */}
      <div 
        style={{ 
          fontSize: '0.825rem', 
          fontFamily: 'var(--font-mono)',
          marginBottom: '1rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.4rem',
          padding: '0.65rem 0.75rem',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-btn)',
          backgroundColor: 'var(--bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
          <Calendar size={14} color="var(--blue)" style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>{formatDateTimeIST(event.dateTime)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
          <MapPin size={14} color="var(--red)" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {event.venue}
          </span>
        </div>
      </div>

      {/* Capacity Progress Bar */}
      <div style={{ marginTop: 'auto', paddingTop: '0.25rem', marginBottom: '1rem' }}>
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.75rem', 
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            marginBottom: '0.35rem',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={12} /> CAPACITY
          </span>
          <span>{event.registeredCount} / {event.capacity} BOOKED</span>
        </div>

        <div className="progress-bar-container" style={{ height: 10 }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${fillPercentage}%`,
              backgroundColor: getProgressColor(),
            }}
          />
        </div>
      </div>

      {/* View Details Button (Full width on mobile) */}
      <div>
        <Link 
          to={`/events/${event.id}`} 
          className="btn btn-outline" 
          style={{ width: '100%', minHeight: 44, justifyContent: 'space-between' }}
        >
          <span>VIEW DETAILS</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};
