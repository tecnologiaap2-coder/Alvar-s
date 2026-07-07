import React from 'react';

export const MetricCard = ({ title, value, subValue, icon: Icon, color = 'var(--primary)' }) => {
  return (
    <div className="glass-panel animate-fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {value}
        </span>
        {subValue && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {subValue}
          </span>
        )}
      </div>

      <div style={{
        backgroundColor: `${color}15`,
        color: color,
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={24} />
      </div>
    </div>
  );
};
export default MetricCard;
