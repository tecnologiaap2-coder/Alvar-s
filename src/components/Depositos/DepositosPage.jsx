import React from 'react';
import { DepositoCard } from './DepositoCard';
import { Badge } from '../shared/Badge';
import { EmptyState } from '../shared/EmptyState';
import { formatBRL, fmtData } from '../../utils/formatters';
import { statusDeposito, diasDesde } from '../../utils/calculations';
import { PiggyBank, BellRing, CalendarDays, CheckCircle2 } from 'lucide-react';

export const DepositosPage = ({
  processos,
  onConfirmar,
  onRenovar,
  onAlertar,
  enviando
}) => {
  
  const ativos = processos.filter(p => p.statusFinal !== "Pago" && p.statusFinal !== "Arquivado");

  // Filtros
  const vencidos = ativos.filter(p => p.dataPrevistaDeposito && diasDesde(p.dataPrevistaDeposito) >= 0 && !p.depositoConfirmado);
  const proximos = ativos.filter(p => p.dataPrevistaDeposito && diasDesde(p.dataPrevistaDeposito) < 0 && !p.depositoConfirmado)
    .sort((a, b) => new Date(a.dataPrevistaDeposito) - new Date(b.dataPrevistaDeposito));
  const confirmados = processos.filter(p => p.depositoConfirmado);

  const totalComPrevisao = processos.filter(p => p.dataPrevistaDeposito).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PiggyBank size={24} />
            <span>Controle de Depósitos Judiciais</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Acompanhamento das datas de depósitos previstas e notificações de protocolos do escritório.
          </p>
        </div>
      </div>

      {totalComPrevisao === 0 ? (
        <EmptyState message="Nenhum processo com data de depósito prevista cadastrada." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Seção 1: Vencidos ou Vencendo Hoje */}
          {vencidos.length > 0 && (
            <div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--danger-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <BellRing size={18} />
                <span>Vencidos ou Vencendo Hoje</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {vencidos.map(p => (
                  <DepositoCard
                    key={p.id}
                    processo={p}
                    onConfirmar={() => onConfirmar(p)}
                    onRenovar={() => onRenovar(p)}
                    onAlertar={() => onAlertar(p)}
                    enviando={enviando}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Seção 2: Próximos Depósitos */}
          {proximos.length > 0 && (
            <div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--info-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <CalendarDays size={18} />
                <span>Próximos Depósitos Previstos</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {proximos.map(p => {
                  const dep = statusDeposito(p);
                  const dr = Math.abs(diasDesde(p.dataPrevistaDeposito));
                  return (
                    <div 
                      key={p.id} 
                      className="glass-panel animate-fade-in" 
                      style={{
                        borderLeft: '4px solid var(--info)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        padding: '1rem'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {p.cliente}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          {p.numero} &middot; {p.vara}
                        </span>
                        {dep && (
                          <div style={{ marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: dep.cor, fontWeight: 600 }}>{dep.label}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--info-text)' }}>
                          {dr}d
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          até {fmtData(p.dataPrevistaDeposito)}
                        </span>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.15rem' }}>
                          {formatBRL(p.valorPrevisto)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seção 3: Confirmados */}
          {confirmados.length > 0 && (
            <div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--success-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <CheckCircle2 size={18} />
                <span>Depósitos Confirmados</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {confirmados.map(p => (
                  <div 
                    key={p.id} 
                    className="glass-panel animate-fade-in" 
                    style={{
                      borderLeft: '4px solid var(--success)',
                      backgroundColor: 'var(--success-bg)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--success-text)' }}>
                        {p.cliente}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                        {p.numero} &middot; Previsto para {fmtData(p.dataPrevistaDeposito)}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--success-text)' }}>
                      {formatBRL(p.valorRecebido)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
export default DepositosPage;
