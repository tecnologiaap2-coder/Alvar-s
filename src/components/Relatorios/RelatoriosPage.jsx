import React, { useState } from 'react';
import { FileText, ClipboardList } from 'lucide-react';
import { formatBRL, parseBRL } from '../../utils/formatters';

export const RelatoriosPage = ({ processos, logEnvios, onClearLogs }) => {
  const [abaRelatorio, setAbaRelatorio] = useState('cliente');

  const totalPrevisto = processos.reduce((s, p) => s + parseBRL(p.valorPrevisto), 0);
  const totalRecebido = processos.reduce((s, p) => s + parseBRL(p.valorRecebido), 0);
  const totalPendente = totalPrevisto - totalRecebido;

  const getGrupoChave = (p) => {
    switch (abaRelatorio) {
      case 'cliente': return p.cliente || 'Não informado';
      case 'comarca': return p.comarca || 'Não informado';
      case 'vara': return p.vara || 'Não informado';
      case 'responsavel': return p.responsavel || 'Não informado';
      case 'tipoCredito': return p.tipoCredito || 'Não informado';
      case 'situacaoAlvara': return p.situacaoAlvara || 'Não informado';
      default: return p.cliente || 'Não informado';
    }
  };

  const gerarRelatorio = () => {
    const map = {};
    processos.forEach(p => {
      const chave = getGrupoChave(p);
      if (!map[chave]) {
        map[chave] = { processos: 0, previsto: 0, recebido: 0 };
      }
      map[chave].processos++;
      map[chave].previsto += parseBRL(p.valorPrevisto);
      map[chave].recebido += parseBRL(p.valorRecebido);
    });

    return Object.entries(map).sort((a, b) => b[1].previsto - a[1].previsto);
  };

  const relatorioData = gerarRelatorio();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={24} />
          <span>Relatórios e Consolidação Financeira</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Agrupamento de processos e visualização de valores previstos, recebidos e pendentes por dimensão.
        </p>
      </div>

      {/* Log de Envios da Sessão */}
      {logEnvios && logEnvios.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ClipboardList size={14} />
              <span>Log de Envios da Sessão</span>
            </span>
            <button 
              className="btn btn-sm btn-secondary" 
              onClick={onClearLogs}
              style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem' }}
            >
              Limpar Logs
            </button>
          </div>
          <div style={{ 
            maxHeight: '180px', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.25rem',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem',
            backgroundColor: 'var(--bg-tertiary)'
          }}>
            {logEnvios.map((log, idx) => {
              const isError = log.msg.startsWith('❌');
              const isSuccess = log.msg.startsWith('✅');
              let color = 'var(--text-secondary)';
              if (isError) color = 'var(--danger-text)';
              else if (isSuccess) color = 'var(--success-text)';
              return (
                <div 
                  key={idx} 
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    color: color,
                    padding: '0.25rem',
                    borderRadius: '4px'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>{log.ts}</span>
                  <span>{log.msg}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dimensões / Filtros do Relatório */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          ['cliente', 'Por Cliente'],
          ['comarca', 'Por Comarca'],
          ['vara', 'Por Vara'],
          ['responsavel', 'Por Responsável'],
          ['tipoCredito', 'Por Tipo de Crédito'],
          ['situacaoAlvara', 'Por Situação']
        ].map(([key, label]) => {
          const isActive = abaRelatorio === key;
          return (
            <button
              key={key}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setAbaRelatorio(key)}
              style={{ fontWeight: 600 }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tabela do Relatório */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                {['Dimensão / Categoria', 'Qtd. Processos', 'Valor Previsto', 'Valor Recebido', 'Pendente'].map(h => (
                  <th key={h} style={{
                    padding: '1rem 1.25rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {relatorioData.map(([categoria, dados], idx) => (
                <tr 
                  key={categoria} 
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: idx % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                    transition: 'background-color var(--transition-fast)'
                  }}
                >
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {categoria}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {dados.processos}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', color: 'var(--success-text)', fontWeight: 600 }}>
                    {formatBRL(dados.previsto)}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {formatBRL(dados.recebido)}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', color: 'var(--danger-text)', fontWeight: 700 }}>
                    {formatBRL(dados.previsto - dados.recebido)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: 700 }}>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>TOTAL CONSOLIDADO</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>{processos.length}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>{formatBRL(processos.reduce((s, p) => s + parseBRL(p.valorPrevisto), 0))}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>{formatBRL(processos.reduce((s, p) => s + parseBRL(p.valorRecebido), 0))}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>{formatBRL(totalPendente)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
};
export default RelatoriosPage;
