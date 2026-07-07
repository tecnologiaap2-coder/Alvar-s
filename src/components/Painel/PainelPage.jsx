import React from 'react';
import { MetricCard } from './MetricCard';
import { Badge } from '../shared/Badge';
import { EmptyState } from '../shared/EmptyState';
import { FolderKanban, TrendingUp, HandCoins, Hourglass, Calendar, AlertCircle } from 'lucide-react';
import { formatBRL } from '../../utils/formatters';
import { calcPrioridade, prazoExpirado, diasDesde, corStatus, badgeStatus, statusDeposito } from '../../utils/calculations';

export const PainelPage = ({ processos, onSelectProcesso, onNavigate }) => {
  const ativos = processos.filter(p => p.statusFinal !== "Pago" && p.statusFinal !== "Arquivado");
  
  // Métricas
  const totalAtivos = ativos.length;
  const totalPrevisto = processos.reduce((s, p) => s + (parseFloat(p.valorPrevisto) || 0), 0);
  const totalRecebido = processos.reduce((s, p) => s + (parseFloat(p.valorRecebido) || 0), 0);
  const totalPendente = totalPrevisto - totalRecebido;

  const expirados = ativos.filter(p => prazoExpirado(p.dataNovaAnalise)).length;
  const parados15 = ativos.filter(p => diasDesde(p.dataUltimaMovimentacao) >= 15).length;
  const parados30 = ativos.filter(p => diasDesde(p.dataUltimaMovimentacao) >= 30).length;
  const altaPrioridade = ativos.filter(p => calcPrioridade(p) === "Alta").length;
  const exigencia = processos.filter(p => p.situacaoAlvara === "Exigência documental").length;
  const erroBanco = processos.filter(p => p.situacaoAlvara === "Erro nos dados bancários").length;

  const depositosHoje = ativos.filter(p => p.dataPrevistaDeposito && diasDesde(p.dataPrevistaDeposito) === 0 && !p.depositoConfirmado).length;
  const depositosAtrasados = ativos.filter(p => p.dataPrevistaDeposito && diasDesde(p.dataPrevistaDeposito) > 0 && !p.depositoConfirmado).length;
  const depositosProximos = ativos.filter(p => {
    if (!p.dataPrevistaDeposito || p.depositoConfirmado) return false;
    const d = diasDesde(p.dataPrevistaDeposito);
    return d < 0 && d >= -5;
  }).length;

  const urgentes = processos.filter(p => 
    (prazoExpirado(p.dataNovaAnalise) || 
     calcPrioridade(p) === "Alta" || 
     (p.dataPrevistaDeposito && diasDesde(p.dataPrevistaDeposito) >= 0 && !p.depositoConfirmado)
    ) && p.statusFinal !== "Pago" && p.statusFinal !== "Arquivado"
  ).slice(0, 8);

  const totalPendentesAlerta = depositosHoje + depositosAtrasados;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Painel de Controle</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Métricas do escritório em tempo real</span>
      </div>

      {/* Alerta de depósitos pendentes */}
      {totalPendentesAlerta > 0 && (
        <div className="glass-panel animate-fade-in" style={{
          backgroundColor: 'var(--danger-bg)',
          borderColor: 'var(--danger-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.25rem'
        }}>
          <div style={{ color: 'var(--danger-text)', display: 'flex', alignItems: 'center' }}>
            <AlertCircle size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 700, color: 'var(--danger-text)', fontSize: '0.95rem', marginBottom: '0.15rem' }}>
              Depósitos pendentes de verificação!
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--danger-text)' }}>
              {depositosHoje > 0 && `${depositosHoje} depósito(s) HOJE. `}
              {depositosAtrasados > 0 && `${depositosAtrasados} depósito(s) ATRASADO(S). `}
            </p>
          </div>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => onNavigate('depositos')}
            style={{ fontWeight: 700 }}
          >
            Ver agora →
          </button>
        </div>
      )}

      {/* Cards Financeiros */}
      <div className="grid-metrics">
        <MetricCard 
          title="Processos Ativos" 
          value={totalAtivos} 
          icon={FolderKanban} 
          color="var(--primary)" 
        />
        <MetricCard 
          title="Valor Total Previsto" 
          value={formatBRL(totalPrevisto)} 
          icon={TrendingUp} 
          color="var(--success)" 
        />
        <MetricCard 
          title="Valor Recebido" 
          value={formatBRL(totalRecebido)} 
          icon={HandCoins} 
          color="var(--success)" 
        />
        <MetricCard 
          title="Valor Pendente" 
          value={formatBRL(totalPendente)} 
          icon={Hourglass} 
          color="var(--warning)" 
        />
      </div>

      {/* Sub-cards de Status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem'
      }}>
        {[
          { label: "Prazos Vencidos", valor: expirados, color: "var(--danger)" },
          { label: "Depósitos Hoje", valor: depositosHoje, color: "var(--danger)" },
          { label: "Dep. Atrasados", valor: depositosAtrasados, color: "var(--warning)" },
          { label: "Dep. Próximos 5d", valor: depositosProximos, color: "var(--info)" },
          { label: "Parados +15d", valor: parados15, color: "var(--warning)" },
          { label: "Parados +30d", valor: parados30, color: "var(--danger)" },
          { label: "Alta Prioridade", valor: altaPrioridade, color: "var(--danger)" },
          { label: "Exigência Doc.", valor: exigencia, color: "var(--warning)" },
          { label: "Erro Bancário", valor: erroBanco, color: "var(--danger)" }
        ].map(item => (
          <div key={item.label} className="glass-panel" style={{
            padding: '1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.25rem',
            borderBottom: `3px solid ${item.color}`
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color }}>{item.valor}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Lista de Processos Urgentes */}
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Calendar size={18} />
          <span>Ações Urgentes Recomendadas</span>
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {urgentes.map(p => {
            const b = badgeStatus(p);
            const dep = statusDeposito(p);
            return (
              <div 
                key={p.id} 
                className="glass-panel animate-fade-in" 
                onClick={() => onSelectProcesso(p)}
                style={{
                  cursor: 'pointer',
                  borderLeft: `4px solid ${corStatus(p)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem'
                }}
              >
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.cliente}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.numero} &middot; {p.vara}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{p.situacaoAlvara}</span>
                  {dep && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <Badge bg={dep.bg} fg={dep.cor}>{dep.label}</Badge>
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <Badge bg={b.bg} fg={b.fg}>{b.label}</Badge>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--success)' }}>
                    {formatBRL(p.valorPrevisto)}
                  </span>
                </div>
              </div>
            );
          })}

          {urgentes.length === 0 && (
            <EmptyState message="Nenhum processo urgente requer ação no momento. Bom trabalho!" />
          )}
        </div>
      </div>
    </div>
  );
};
export default PainelPage;
