import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { RESPONSAVEIS, MEIOS_CONTATO } from '../../lib/constants';
import { hoje } from '../../utils/formatters';

export const ModalHistorico = ({ isOpen, onClose, onRegistrar, cliente }) => {
  const [form, setForm] = useState({
    data: hoje(),
    responsavel: RESPONSAVEIS[0] || 'Secretária',
    meio: '',
    setor: '',
    resposta: '',
    proximaProvidencia: '',
    novaData: ''
  });

  const [erro, setErro] = useState('');

  const handleSubmit = () => {
    if (!form.data || !form.responsavel || !form.meio || !form.resposta) {
      setErro('Preencha os campos obrigatórios: Data, Responsável, Meio e Resposta.');
      return;
    }
    onRegistrar(form);
    onClose();
  };

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErro('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📝 Registrar Contato">
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Cliente: <strong>{cliente}</strong>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Data *</label>
            <input 
              type="date" 
              className="form-control" 
              value={form.data} 
              onChange={e => update('data', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Responsável *</label>
            <select 
              className="form-control" 
              value={form.responsavel} 
              onChange={e => update('responsavel', e.target.value)}
            >
              {RESPONSAVEIS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Meio de Contato *</label>
            <select 
              className="form-control" 
              value={form.meio} 
              onChange={e => update('meio', e.target.value)}
            >
              <option value="">Selecione...</option>
              {MEIOS_CONTATO.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Setor / Servidor</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ex: Vara Cível" 
              value={form.setor} 
              onChange={e => update('setor', e.target.value)} 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Resposta Recebida *</label>
          <textarea 
            rows={3} 
            className="form-control" 
            placeholder="O que foi dito pela secretaria/servidor?" 
            value={form.resposta} 
            onChange={e => update('resposta', e.target.value)} 
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Próxima Providência</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ação sugerida pós-contato" 
              value={form.proximaProvidencia} 
              onChange={e => update('proximaProvidencia', e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nova Data de Análise</label>
            <input 
              type="date" 
              className="form-control" 
              value={form.novaData} 
              onChange={e => update('novaData', e.target.value)} 
            />
          </div>
        </div>

        {erro && (
          <div style={{ color: 'var(--danger-text)', fontSize: '0.75rem', fontWeight: 600 }}>
            ⚠️ {erro}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Registrar Contato</button>
        </div>
      </div>
    </Modal>
  );
};
export default ModalHistorico;
