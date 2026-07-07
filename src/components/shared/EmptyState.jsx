import React from 'react';

export const EmptyState = ({ message = 'Nenhum registro encontrado.' }) => {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
      <p>{message}</p>
    </div>
  );
};
