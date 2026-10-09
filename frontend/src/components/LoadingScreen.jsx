import React from 'react';

/**
 * Standard loading indicator with official GDG logo and responsive typography
 */
export const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <img
        src="/gdg-logo.svg"
        alt="GDG RBU logo"
        width="72"
        height="38"
        className="gdg-logo"
        style={{ marginBottom: '1.25rem', opacity: 0.95 }}
      />
      <div className="spinner" style={{ width: 34, height: 34, borderWidth: 3 }}></div>
      <p
        style={{
          marginTop: '1rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--muted)',
          fontSize: '0.875rem',
          letterSpacing: '0.02em',
        }}
      >
        {message}
      </p>
    </div>
  );
};
