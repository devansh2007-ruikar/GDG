import React from 'react';

export const SkeletonCard = () => {
  return (
    <div 
      className="card" 
      style={{ 
        minHeight: 340, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.85rem',
        border: '2px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 90, height: 24, background: 'var(--grid)', border: '1px solid var(--border)', borderRadius: 4 }}></div>
        <div style={{ width: 80, height: 20, background: 'var(--grid)', border: '1px solid var(--border)', borderRadius: 4 }}></div>
      </div>

      <div style={{ width: '80%', height: 28, background: 'var(--grid)', border: '1px solid var(--border)', borderRadius: 4 }}></div>
      <div style={{ width: '100%', height: 16, background: 'var(--grid)', borderRadius: 4 }}></div>
      <div style={{ width: '92%', height: 16, background: 'var(--grid)', borderRadius: 4 }}></div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ width: '50%', height: 16, background: 'var(--grid)', borderRadius: 4 }}></div>
        <div className="progress-bar-container" style={{ background: 'var(--grid)' }}></div>
        <div style={{ width: '100%', height: 42, background: 'var(--grid)', border: '2px solid var(--border)', borderRadius: 8, marginTop: '0.5rem' }}></div>
      </div>
    </div>
  );
};
