import React from 'react';

/**
 * High-fidelity Skeleton loader matching the exact dimensions and layout of EventDetailPage.
 * Eliminates Cumulative Layout Shift (CLS) and blank screen flickers.
 */
export const EventDetailSkeleton = () => {
  return (
    <div 
      className="container" 
      style={{ 
        paddingTop: 'clamp(1.5rem, 4vw, 3rem)', 
        paddingBottom: 'clamp(5rem, 10vw, 7rem)', 
        maxWidth: 920 
      }}
      aria-busy="true"
      aria-label="Loading event details"
    >
      {/* Back Link Placeholder */}
      <div 
        style={{ 
          width: 140, 
          height: 24, 
          backgroundColor: 'var(--grid)', 
          borderRadius: 4, 
          marginBottom: '1.5rem' 
        }} 
      />

      {/* Main Event Card Panel */}
      <div 
        style={{ 
          border: '2px solid var(--border)', 
          boxShadow: 'var(--shadow-lg)', 
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--surface)',
        }}
      >
        {/* Header Area */}
        <div 
          style={{ 
            backgroundColor: 'var(--header-tint)', 
            padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem)', 
            borderBottom: '2px solid var(--border)',
          }}
        >
          {/* Badge & Seat Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ width: 80, height: 26, backgroundColor: 'var(--border)', opacity: 0.2, borderRadius: 4 }} />
            <div style={{ width: 130, height: 26, backgroundColor: 'var(--border)', opacity: 0.2, borderRadius: 4 }} />
          </div>

          {/* Title Placeholder */}
          <div style={{ width: '85%', height: 38, backgroundColor: 'var(--border)', opacity: 0.25, borderRadius: 4, marginBottom: '1rem' }} />

          {/* Description Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ width: '100%', height: 16, backgroundColor: 'var(--border)', opacity: 0.15, borderRadius: 4 }} />
            <div style={{ width: '92%', height: 16, backgroundColor: 'var(--border)', opacity: 0.15, borderRadius: 4 }} />
            <div style={{ width: '70%', height: 16, backgroundColor: 'var(--border)', opacity: 0.15, borderRadius: 4 }} />
          </div>
        </div>

        {/* Details & Capacity Section */}
        <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem)' }}>
          {/* Metadata Grid */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', 
              gap: '1rem', 
              marginBottom: '2rem',
            }}
          >
            {[1, 2, 3].map((idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: '1rem 1.25rem', 
                  border: '2px solid var(--border)', 
                  borderRadius: 'var(--radius-btn)',
                  backgroundColor: 'var(--bg)',
                  height: 84,
                }}
              >
                <div style={{ width: 80, height: 14, backgroundColor: 'var(--border)', opacity: 0.2, marginBottom: '0.6rem', borderRadius: 2 }} />
                <div style={{ width: '75%', height: 18, backgroundColor: 'var(--border)', opacity: 0.3, borderRadius: 4 }} />
              </div>
            ))}
          </div>

          {/* Capacity Progress Bar */}
          <div 
            style={{ 
              padding: '1.25rem', 
              border: '2px solid var(--border)', 
              borderRadius: 'var(--radius-btn)',
              backgroundColor: 'var(--bg)',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ width: 110, height: 14, backgroundColor: 'var(--border)', opacity: 0.2, borderRadius: 2 }} />
              <div style={{ width: 140, height: 14, backgroundColor: 'var(--border)', opacity: 0.2, borderRadius: 2 }} />
            </div>
            <div className="progress-bar-container" style={{ height: 16, backgroundColor: 'var(--border)', opacity: 0.15 }} />
          </div>

          {/* Desktop Inline Action Button Placeholder */}
          <div 
            className="inline-action-desktop"
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderTop: '2px solid var(--border)', 
              paddingTop: '1.75rem', 
            }}
          >
            <div style={{ width: 220, height: 16, backgroundColor: 'var(--border)', opacity: 0.15, borderRadius: 4 }} />
            <div style={{ width: 220, height: 48, backgroundColor: 'var(--border)', opacity: 0.25, borderRadius: 'var(--radius-btn)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
