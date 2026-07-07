import React from 'react';
import { Badge } from '../shared/Badge';
import { formatBRL } from '../../utils/formatters';
import { badgeStatus, statusDeposito, corStatus } from '../../utils/calculations';

export const ProcessoCard = ({ processo, isSelected, onClick }) => {
  const b = badgeStatus(processo);
  const dep = statusDeposito(processo);
  
  return (
    <div 
      onClick={onClick} 
      className="glass-panel animate-fade-in" 
      style={{
        background: isSelected ? 'var(--accent-light)' : 'var(--bg-secondary)',
        borderLeft: `4px solid ${corStatus(processo)}`,
        borderTopColor: isSelected ? 'var(--accent)' : undefined,
        borderRightColor: isSelected ? 'var(--accent)' : undefined,
        borderBottomColor: isSelected ? 'var(--accent)' : undefined,
        cursor: 'pointer',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {processo.cliente}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {processo.numero}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
          <Badge bg={b.bg} fg={b.fg}>{b.label}</Badge>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)' }}>
            {formatBRL(processo.valorPrevisto)}
          </span>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
        <strong>Vara:</strong> {processo.vara} &middot; <strong>Comarca:</strong> {processo.comarca}
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        {processo.situacaoAlvara}
      </div>

      {dep && (
        <div style={{ marginTop: '0.25rem' }}>
          <Badge bg={dep.bg} fg={dep.cor}>{dep.label}</Badge>
        </div>
      )}
    </div>
  );
};
export default ProcessoCard;
