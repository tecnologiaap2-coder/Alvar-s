import React from 'react';

export const LoadingSpinner = ({ label = 'Carregando...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '1rem' }}>
      <div className="spinner"></div>
      {label && <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>}
    </div>
  );
};
