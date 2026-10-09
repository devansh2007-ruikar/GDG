import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="card" style={{ height: 320, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 999 }}></div>
        <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 999 }}></div>
      </div>
      <div className="skeleton" style={{ width: '85%', height: 26 }}></div>
      <div className="skeleton" style={{ width: '100%', height: 16 }}></div>
      <div className="skeleton" style={{ width: '90%', height: 16 }}></div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ width: '40%', height: 14 }}></div>
        <div className="skeleton" style={{ width: '100%', height: 8, borderRadius: 999 }}></div>
        <div className="skeleton" style={{ width: '100%', height: 38, borderRadius: 8, marginTop: '0.5rem' }}></div>
      </div>
    </div>
  );
};
