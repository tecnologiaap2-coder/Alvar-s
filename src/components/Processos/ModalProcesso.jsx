import React, { useState } from 'react';
import { X, Calendar, ClipboardList } from 'lucide-react';
import { 
  SITUACOES_ALVARA, 
  STATUS_FINAL, 
  TIPOS_CREDITO, 
  TIPOS_PARTE_CONTRARIA, 
  SISTEMAS, 
  MEIOS_CONTATO, 
  RESPONSAVEIS 
} from '../../lib/constants';

const LABELS_OBR = {
  numero: "Número do Processo (CNJ)",
  cliente: "Cliente",
  comarca: "Comarca",
  vara: "Vara / Secretaria",
  tipoCredito: "Tipo de Crédito",
  valorPrevisto: "Valor Previsto",
  situacaoAlvara: "Situação do Alvará",
  dataUltimaMovimentacao: "Data da Última Movimentação",
  proximaProvidencia: "Próxima Providência",
  dataNovaAnalise: "Data para Nova Análise",
  responsavel: "Responsável",
};

export const ModalProcesso = ({ processo, onSalvar, onFechar }) => {
  const [form, setForm] = useState(processo);
  const [dataDepositoOriginal] = useState(processo.dataPrevistaDeposito || "");
  const [erros, setErros] = useState({});
  const [tentouSalvar, setTentouSalvar] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (erros[k]) setErros(e => ({ ...e, [k]: false }));
  };

  const validar = () => {
    const e = {};
    Object.keys(LABELS_OBR).forEach(k => {
      if (!form[k]) e[k] = true;
    });
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const camposInvalidos = Object.keys(erros).filter(k => erros[k]).map(k => LABELS_OBR[k]);

  const handleSalvar = () => {
    setTentouSalvar(true);
    if (!validar()) return;
    const dataAlterada = form.dataPrevistaDeposito && form.dataPrevistaDeposito !== dataDepositoOriginal;
    onSalvar(form, dataAlterada);
  };

  const renderCampo = (label, chave, tipo = "text", opts = null, obrigatorio = false) => {
    const inv = tentouSalvar && obrigatorio && !form[chave];
    return (
      <div className="form-group">
        <label className="form-label" style={{ color: inv ? 'var(--danger-text)' : 'var(--text-secondary)' }}>
          {label} {obrigatorio && <span style={{ color: 'var(--danger-text)' }}>*</span>}
          {inv && <span style={{ fontSize: '0.65rem', color: 'var(--danger-text)', marginLeft: '4px', textTransform: 'none' }}>(obrigatório)</span>}
        </label>
        {opts ? (
          <select 
            value={form[chave] || ""} 
            onChange={e => set(chave, e.target.value)} 
            className="form-control"
            style={{ width: '100%', background: inv ? 'var(--danger-bg)' : undefined }}
          >
            <option value="">Selecione...</option>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : tipo === "textarea" ? (
          <textarea 
            rows={2} 
            value={form[chave] || ""} 
            onChange={e => set(chave, e.target.value)} 
            className="form-control"
            style={{ width: '100%', resize: 'vertical', background: inv ? 'var(--danger-bg)' : undefined }}
          />
        ) : (
          <input 
            type={tipo} 
            value={form[chave] || ""} 
            onChange={e => set(chave, e.target.value)} 
            className="form-control"
            style={{ width: '100%', background: inv ? 'var(--danger-bg)' : undefined }}
          />
        )}
      </div>
    );
  };

  const renderSectionHeader = (titulo) => (
    <div style={{
      fontSize: '0.75rem',
      fontWeight: 700,
      color: 'var(--accent)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '2px solid var(--accent-light)',
      paddingBottom: '4px',
      marginTop: '1rem',
      marginBottom: '0.75rem'
    }}>
      {titulo}
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.55)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '20px 16px',
      overflowY: 'auto',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '780px',
        padding: 0,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        marginBottom: '20px'
      }}>
        {/* Header */}
        <div style={{
          background: 'var(--primary)',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>
            {form.id ? 'Editar Processo' : 'Novo Processo'}
          </h3>
          <button 
            onClick={onFechar} 
            style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.8, cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{
            backgroundColor: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <ClipboardList size={18} style={{ color: 'var(--success)', marginTop: '2px' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--success-text)' }}>
              Ao salvar, um e-mail de protocolo será gerado no backend para <strong>felipe@arosopontinadvogados.com.br</strong> e <strong>escritorio@arosopontinadvogados.com.br</strong>, e o evento de vencimento será criado no Google Calendar.
            </span>
          </div>

          {renderSectionHeader('Identificação')}
          <div className="form-row">
            {renderCampo('Número do Processo (CNJ)', 'numero', 'text', null, true)}
            {renderCampo('Cliente', 'cliente', 'text', null, true)}
          </div>
          <div className="form-row">
            {renderCampo('Parte Contrária', 'parteContraria')}
            {renderCampo('Tipo de Parte Contrária', 'tipoParteContraria', 'text', TIPOS_PARTE_CONTRARIA)}
          </div>
          <div className="form-row">
            {renderCampo('Comarca', 'comarca', 'text', null, true)}
            {renderCampo('Vara / Secretaria', 'vara', 'text', null, true)}
          </div>
          <div className="form-row">
            {renderCampo('Sistema', 'sistema', 'text', SISTEMAS)}
            {renderCampo('Link do Processo', 'linkProcesso')}
          </div>

          {renderSectionHeader('Valores e Crédito')}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            {renderCampo('Tipo de Crédito', 'tipoCredito', 'text', TIPOS_CREDITO, true)}
            {renderCampo('Valor Previsto (R$)', 'valorPrevisto', 'text', null, true)}
            {renderCampo('Valor Recebido (R$)', 'valorRecebido', 'text')}
          </div>

          {/* Campo Data Prevista Depósito com destaque */}
          <div style={{
            background: 'var(--accent-light)',
            border: '2px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            margin: '0.5rem 0'
          }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: 'var(--accent-hover)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Calendar size={16} />
              <span>Data Prevista de Depósito / Transferência</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Data em que o depósito ou a transferência bancária deve cair. Ao preencher, o sistema agendará alertas e lembretes automáticos.
            </p>
            <input 
              type="date" 
              value={form.dataPrevistaDeposito || ""} 
              onChange={e => set("dataPrevistaDeposito", e.target.value)} 
              className="form-control"
              style={{
                width: '100%',
                borderColor: 'var(--accent)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--accent-hover)'
              }}
            />
          </div>

          {renderSectionHeader('Situação e Providências')}
          <div className="form-row">
            {renderCampo('Situação do Alvará', 'situacaoAlvara', 'text', SITUACOES_ALVARA, true)}
            {renderCampo('Status Final', 'statusFinal', 'text', STATUS_FINAL)}
          </div>
          <div className="form-row">
            {renderCampo('Prioridade', 'prioridade', 'text', ['Alta', 'Média', 'Baixa'])}
            {renderCampo('Responsável', 'responsavel', 'text', RESPONSAVEIS, true)}
          </div>
          <div className="form-row">
            {renderCampo('Data da Última Movimentação', 'dataUltimaMovimentacao', 'date', null, true)}
            {renderCampo('Data para Nova Análise', 'dataNovaAnalise', 'date', null, true)}
          </div>
          {renderCampo('Última Movimentação', 'ultimaMovimentacao', 'textarea')}
          {renderCampo('Próxima Providência', 'proximaProvidencia', 'text', null, true)}

          {renderSectionHeader('Contato com Secretaria')}
          <div className="form-row">
            {renderCampo('Data do Último Contato', 'dataUltimoContato', 'date')}
            {renderCampo('Meio de Contato', 'meioContato', 'text', MEIOS_CONTATO)}
          </div>
          {renderCampo('Resultado do Contato', 'resultadoContato', 'textarea')}
          {renderCampo('Próxima Ação', 'proximaAcao')}

          {renderSectionHeader('Drive e Documentos')}
          <div className="form-row">
            {renderCampo('Link da Pasta no Drive', 'linkDrive')}
            {renderCampo('Documentos Pendentes', 'documentosPendentes')}
          </div>
          {renderCampo('Observações', 'observacoes', 'textarea')}

          {/* Erros acumulados */}
          {tentouSalvar && camposInvalidos.length > 0 && (
            <div style={{
              backgroundColor: 'var(--danger-bg)',
              border: '2px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--danger-text)', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                ⚠️ Corrija os erros listados abaixo para salvar o processo:
              </span>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {camposInvalidos.map(lbl => (
                  <li key={lbl} style={{ fontSize: '0.75rem', color: 'var(--danger-text)', fontWeight: 600 }}>
                    {lbl}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rodapé de Controles */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1rem'
          }}>
            <span style={{ fontSize: '0.75rem', color: tentouSalvar && camposInvalidos.length > 0 ? 'var(--danger-text)' : 'var(--text-muted)', fontWeight: 600 }}>
              {tentouSalvar && camposInvalidos.length > 0 ? `⚠️ ${camposInvalidos.length} campo(s) obrigatório(s) pendente(s)` : '* Campos obrigatórios'}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={onFechar}>Cancelar</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSalvar}
                style={{ 
                  backgroundColor: tentouSalvar && camposInvalidos.length > 0 ? 'var(--danger)' : undefined,
                  borderColor: tentouSalvar && camposInvalidos.length > 0 ? 'var(--danger-border)' : undefined,
                  color: '#ffffff',
                  fontWeight: 700
                }}
              >
                {form.id ? 'Salvar Alterações' : 'Cadastrar Processo'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default ModalProcesso;
