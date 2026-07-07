import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { ProcessoCard } from './ProcessoCard';
import { ProcessoDetalhe } from './ProcessoDetalhe';
import { EmptyState } from '../shared/EmptyState';
import { STATUS_FINAL } from '../../lib/constants';
import { calcPrioridade } from '../../utils/calculations';

export const ProcessosPage = ({
  processos,
  processoDetalhe,
  setProcessoDetalhe,
  onOpenNovoProcesso,
  onEdit,
  onConfirmarDeposito,
  onNovaDataDeposito,
  onRegistrarContato,
  onCriarEventoCalendar,
  onEnviarAlertaManual,
  onExcluir,
  enviando
}) => {
  const [filtros, setFiltros] = useState({ busca: '', status: '', prioridade: '' });

  const handleClearFilters = () => {
    setFiltros({ busca: '', status: '', prioridade: '' });
  };

  const processosFiltrados = processos.filter(p => {
    const b = filtros.busca.toLowerCase();
    const matchesBusca = !b || 
      p.numero.toLowerCase().includes(b) || 
      p.cliente.toLowerCase().includes(b) || 
      p.comarca.toLowerCase().includes(b) ||
      p.vara.toLowerCase().includes(b);
    
    const matchesStatus = !filtros.status || p.statusFinal === filtros.status;
    const matchesPrioridade = !filtros.prioridade || calcPrioridade(p) === filtros.prioridade;

    return matchesBusca && matchesStatus && matchesPrioridade;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Barra de Ações & Filtros */}
      <div className="glass-panel" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '1rem',
        alignItems: 'center'
      }}>
        {/* Input de Busca */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar por cliente, número CNJ, comarca, vara..."
            className="form-control"
            value={filtros.busca}
            onChange={e => setFiltros(f => ({ ...f, busca: e.target.value }))}
            style={{ paddingLeft: '2.25rem', width: '100%' }}
          />
        </div>

        {/* Filtro Status */}
        <select
          value={filtros.status}
          onChange={e => setFiltros(f => ({ ...f, status: e.target.value }))}
          className="form-control"
          style={{ flex: '0 1 180px', background: 'var(--bg-secondary)' }}
        >
          <option value="">Todos os status</option>
          {STATUS_FINAL.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Filtro Prioridade */}
        <select
          value={filtros.prioridade}
          onChange={e => setFiltros(f => ({ ...f, prioridade: e.target.value }))}
          className="form-control"
          style={{ flex: '0 1 160px', background: 'var(--bg-secondary)' }}
        >
          <option value="">Toda prioridade</option>
          <option value="Alta">Alta</option>
          <option value="Média">Média</option>
          <option value="Baixa">Baixa</option>
        </select>

        {/* Limpar Filtros */}
        {(filtros.busca || filtros.status || filtros.prioridade) && (
          <button 
            className="btn btn-secondary" 
            onClick={handleClearFilters}
            style={{ padding: '0.5rem 1rem' }}
          >
            Limpar
          </button>
        )}

        {/* Novo Processo Button */}
        <button 
          className="btn btn-primary" 
          onClick={onOpenNovoProcesso}
          style={{ marginLeft: 'auto' }}
        >
          <Plus size={16} />
          <span>Novo Processo</span>
        </button>
      </div>

      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {processosFiltrados.length} processo(s) encontrado(s)
      </span>

      {/* Grid Principal (Lista de Processos + Sidebar Detalhes) */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        
        {/* Lista de Processos */}
        <div style={{
          flex: processoDetalhe ? '0 0 380px' : '1',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {processosFiltrados.map(p => (
            <ProcessoCard
              key={p.id}
              processo={p}
              isSelected={processoDetalhe?.id === p.id}
              onClick={() => setProcessoDetalhe(processoDetalhe?.id === p.id ? null : p)}
            />
          ))}

          {processosFiltrados.length === 0 && (
            <EmptyState message="Nenhum processo corresponde aos filtros de busca aplicados." />
          )}
        </div>

        {/* Painel Lateral de Detalhes */}
        {processoDetalhe && (
          <ProcessoDetalhe
            processo={processos.find(x => x.id === processoDetalhe.id) || processoDetalhe}
            onEdit={onEdit}
            onClose={() => setProcessoDetalhe(null)}
            onConfirmarDeposito={onConfirmarDeposito}
            onNovaDataDeposito={onNovaDataDeposito}
            onRegistrarContato={onRegistrarContato}
            onCriarEventoCalendar={onCriarEventoCalendar}
            onEnviarAlertaManual={onEnviarAlertaManual}
            onExcluir={onExcluir}
            enviando={enviando}
          />
        )}
      </div>

    </div>
  );
};
export default ProcessosPage;
