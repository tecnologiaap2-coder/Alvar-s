import React, { useState } from 'react';
import { Edit, Trash2, Calendar, Mail, FileText, ExternalLink, History, User, MapPin, PiggyBank, X, AlertTriangle } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { formatBRL, fmtData, parseBRL } from '../../utils/formatters';
import { badgeStatus, statusDeposito, corStatus, calcPrioridade, diasDesde } from '../../utils/calculations';

export const ProcessoDetalhe = ({
  processo,
  onEdit,
  onClose,
  onConfirmarDeposito,
  onNovaDataDeposito,
  onRegistrarContato,
  onCriarEventoCalendar,
  onEnviarAlertaManual,
  onExcluir,
  enviando
}) => {
  const b = badgeStatus(processo);
  const dep = statusDeposito(processo);

  return (
    <div className="glass-panel animate-fade-in" style={{
      flex: 1,
      minWidth: 0,
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      maxHeight: 'calc(100vh - 160px)',
      display: 'flex',
      flexDirection: 'column',
      padding: 0
    }}>
      {/* Cabeçalho do Detalhe */}
      <div style={{
        background: 'var(--primary)',
        color: '#ffffff',
        padding: '1rem 1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h4 style={{ fontWeight: 800, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {processo.cliente}
          </h4>
          <span style={{ fontSize: '0.75rem', opacity: 0.8, fontFamily: 'monospace' }}>
            {processo.numero}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Badge bg={b.bg} fg={b.fg}>{b.label}</Badge>
          <button 
            className="btn btn-accent btn-sm" 
            onClick={() => onEdit(processo)}
            style={{ padding: '0.35rem 0.75rem' }}
          >
            <Edit size={12} />
            <span>Editar</span>
          </button>
          <button 
            className="btn btn-secondary btn-sm btn-icon" 
            onClick={onClose}
            style={{ 
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Corpo do Detalhe (Scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        
        {/* Painel do Depósito */}
        <div style={{
          background: dep ? dep.bg : 'var(--bg-tertiary)',
          border: `2px solid ${dep ? dep.cor : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: dep ? dep.cor : 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <PiggyBank size={14} />
            <span>Previsão de Depósito</span>
          </div>

          {processo.dataPrevistaDeposito ? (
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: dep ? dep.cor : 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {fmtData(processo.dataPrevistaDeposito)}
              </div>
              {dep && (
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: dep.cor, marginBottom: '0.75rem' }}>
                  {dep.label}
                </div>
              )}

              {!processo.depositoConfirmado && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => onConfirmarDeposito(processo)}
                    disabled={enviando}
                    style={{ backgroundColor: 'var(--success)', color: '#ffffff', fontWeight: 700 }}
                  >
                    Confirmar pagamento
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary" 
                    onClick={() => onNovaDataDeposito(processo)}
                    style={{ fontWeight: 700 }}
                  >
                    Renovar data
                  </button>
                  {diasDesde(processo.dataPrevistaDeposito) >= 0 && (
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => onNovaDataDeposito(processo, true)} // dispara alerta direto
                      disabled={enviando}
                      style={{ fontWeight: 600 }}
                    >
                      Alertar atraso
                    </button>
                  )}
                </div>
              )}
              {processo.depositoConfirmado && (
                <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 700 }}>
                  ✓ Depósito Confirmado e Pago
                </span>
              )}

              {processo.historicoRenovacoes?.length > 0 && (
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Histórico de Renovações ({processo.historicoRenovacoes.length})
                  </span>
                  {processo.historicoRenovacoes.map((r, idx) => (
                    <div key={idx} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                      {fmtData(r.dataAnterior)} &rarr; {fmtData(r.novaData)} &middot; <i>{r.motivo || 'sem motivo'}</i> &middot; {r.responsavel}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Nenhuma data de depósito prevista.
              </p>
              <button 
                className="btn btn-sm btn-accent" 
                onClick={() => onEdit(processo)}
                style={{ fontWeight: 700 }}
              >
                + Definir data
              </button>
            </div>
          )}
        </div>

        {/* Blocos de valores */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.5rem',
          marginBottom: '1.25rem'
        }}>
          {[
            { label: 'Previsto', value: formatBRL(processo.valorPrevisto), color: 'var(--success)' },
            { label: 'Recebido', value: formatBRL(processo.valorRecebido), color: 'var(--primary)' },
            { label: 'Pendente', value: formatBRL(parseBRL(processo.valorPrevisto) - parseBRL(processo.valorRecebido)), color: 'var(--danger)' }
          ].map(item => (
            <div key={item.label} style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                {item.label}
              </span>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: item.color, marginTop: '0.15rem' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Ficha técnica do processo */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          marginBottom: '1.25rem'
        }}>
          {[
            ['Situação do Alvará', processo.situacaoAlvara],
            ['Status Final', processo.statusFinal],
            ['Prioridade', calcPrioridade(processo)],
            ['Responsável', processo.responsavel],
            ['Comarca', processo.comarca],
            ['Vara / Secretaria', processo.vara],
            ['Última Movimentação', fmtData(processo.dataUltimaMovimentacao)],
            ['Nova Análise', fmtData(processo.dataNovaAnalise)]
          ].map(([label, val]) => (
            <div key={label} style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.75rem'
            }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>
                {label}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {val || '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Próxima providência */}
        {processo.proximaProvidencia && (
          <div style={{
            backgroundColor: 'var(--warning-bg)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            borderLeft: '3px solid var(--warning)'
          }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--warning-text)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.15rem' }}>
              Próxima Providência
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              {processo.proximaProvidencia}
            </p>
          </div>
        )}

        {/* Links anexos */}
        {(processo.linkProcesso || processo.linkDrive) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {processo.linkProcesso && (
              <a 
                href={processo.linkProcesso} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--primary)', borderColor: 'var(--border-color)' }}
              >
                <ExternalLink size={12} />
                <span>Link do Processo</span>
              </a>
            )}
            {processo.linkDrive && (
              <a 
                href={processo.linkDrive} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--success-text)', borderColor: 'var(--success-border)' }}
              >
                <ExternalLink size={12} />
                <span>Pasta no Drive</span>
              </a>
            )}
          </div>
        )}

        {/* Ações operacionais rápidas */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          marginBottom: '1.25rem'
        }}>
          <button 
            className="btn btn-sm btn-primary" 
            onClick={() => onRegistrarContato(processo)}
            style={{ fontWeight: 600 }}
          >
            <History size={12} />
            <span>Registrar Contato</span>
          </button>
          <button 
            className="btn btn-sm btn-secondary" 
            onClick={() => onCriarEventoCalendar(processo)}
            disabled={enviando}
            style={{ fontWeight: 600 }}
          >
            <Calendar size={12} />
            <span>Criar no Calendar</span>
          </button>
          <button 
            className="btn btn-sm btn-secondary" 
            onClick={() => onEnviarAlertaManual(processo)}
            disabled={enviando}
            style={{ fontWeight: 600 }}
          >
            <Mail size={12} />
            <span>Alertar por E-mail</span>
          </button>
          <button 
            className="btn btn-sm btn-danger btn-icon" 
            onClick={() => onExcluir(processo.id)}
            title="Excluir Processo"
            style={{ marginLeft: 'auto' }}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Histórico de contatos realizados */}
        {processo.historico?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Histórico de Contatos ({processo.historico.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {processo.historico.map((h, idx) => (
                <div 
                  key={idx} 
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    borderLeft: '3px solid var(--text-muted)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {h.responsavel} &middot; {h.meio}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {fmtData(h.data)}
                    </span>
                  </div>
                  {h.setor && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem' }}>
                      Setor: {h.setor}
                    </span>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {h.resposta}
                  </p>
                  {h.proximaProvidencia && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>
                      &rarr; Providência: {h.proximaProvidencia}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default ProcessoDetalhe;
