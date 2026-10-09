import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const EventCard = ({ event }) => {
  const isFull = event.seatsLeft === 0;
  const isPast = new Date(event.dateTime).getTime() <= Date.now();
  const fillPercentage = Math.min(100, (event.registeredCount / event.capacity) * 100);
  const seatsLeftPercentage = (event.seatsLeft / event.capacity) * 100;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
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

  // Progress bar color: Green fill, yellow when < 30% left, red if full
  const getProgressColor = () => {
    if (isFull) return 'var(--red)';
    if (seatsLeftPercentage <= 30) return 'var(--yellow)';
    return 'var(--green)';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="card card-interactive"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
    >
      {/* Category Tag & Seat Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span className={`badge ${getCategoryClass(event.category)}`}>
          {event.category}
        </span>

        {isFull ? (
          <span className="badge badge-full">FULL</span>
        ) : isPast ? (
          <span className="badge badge-default">CONCLUDED</span>
        ) : (
          <span 
            style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              color: seatsLeftPercentage <= 30 ? 'var(--red)' : 'var(--green)',
              background: 'rgba(0,0,0,0.04)',
              padding: '0.2rem 0.5rem',
              border: '1px solid var(--border)',
              borderRadius: 4,
            }}
          >
            {event.seatsLeft} {event.seatsLeft === 1 ? 'SEAT LEFT' : 'SEATS LEFT'}
          </span>
        )}
      </div>

      {/* Card Title */}
      <h3 
        style={{ 
          fontFamily: 'var(--font-heading)',
          fontSize: '1.35rem', 
          fontWeight: 700, 
          letterSpacing: '-0.02em', 
          marginBottom: '0.65rem', 
          lineHeight: 1.1,
        }}
      >
        <Link to={`/events/${event.id}`} style={{ color: 'inherit' }}>
          {event.title}
        </Link>
      </h3>

      {/* Description in Mono */}
      <p 
        style={{
          fontSize: '0.875rem',
          color: 'var(--muted)',
          marginBottom: '1.25rem',
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

      {/* Event Meta with Icons */}
      <div 
        style={{ 
          fontSize: '0.825rem', 
          fontFamily: 'var(--font-mono)',
          marginBottom: '1.25rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.45rem',
          padding: '0.75rem',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-btn)',
          backgroundColor: 'var(--bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
          <Calendar size={14} color="var(--blue)" />
          <span style={{ fontWeight: 600 }}>{formatDate(event.dateTime)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
          <MapPin size={14} color="var(--red)" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {event.venue}
          </span>
        </div>
      </div>

      {/* Capacity Progress Bar with Black Border */}
      <div style={{ marginTop: 'auto', paddingTop: '0.5rem', marginBottom: '1.25rem' }}>
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

        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${fillPercentage}%`,
              backgroundColor: getProgressColor(),
            }}
          />
        </div>
      </div>

      {/* View Details Button */}
      <div>
        <Link 
          to={`/events/${event.id}`} 
          className="btn btn-outline" 
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <span>VIEW DETAILS</span>
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};
