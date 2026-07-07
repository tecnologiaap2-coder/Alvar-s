import React from 'react';
import { Badge } from '../shared/Badge';
import { formatBRL } from '../../utils/formatters';
import { statusDeposito } from '../../utils/calculations';

export const DepositoCard = ({ processo, onConfirmar, onRenovar, onAlertar, enviando }) => {
  const dep = statusDeposito(processo);

  return (
    <div className="glass-panel animate-fade-in" style={{
      borderLeft: '4px solid var(--danger)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{processo.cliente}</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{processo.numero} &middot; {processo.vara}</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{processo.situacaoAlvara}</p>
          {dep && (
            <div style={{ marginTop: '0.25rem' }}>
              <Badge bg={dep.bg} fg={dep.cor}>{dep.label}</Badge>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--success)' }}>{formatBRL(processo.valorPrevisto)}</span>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-sm" 
              onClick={onConfirmar} 
              disabled={enviando}
              style={{ backgroundColor: 'var(--success)', color: '#ffffff', fontWeight: 700 }}
            >
              Confirmar
            </button>
            <button 
              className="btn btn-sm btn-secondary" 
              onClick={onRenovar}
              style={{ fontWeight: 700 }}
            >
              Prorrogar
            </button>
            <button 
              className="btn btn-sm btn-danger" 
              onClick={onAlertar} 
              disabled={enviando}
              style={{ fontWeight: 600 }}
            >
              Alertar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DepositoCard;
