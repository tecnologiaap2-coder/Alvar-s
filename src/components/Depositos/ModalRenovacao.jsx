import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { RESPONSAVEIS } from '../../lib/constants';
import { fmtData } from '../../utils/formatters';

export const ModalRenovacao = ({ isOpen, onClose, onRenovar, processo }) => {
  const [form, setForm] = useState({
    novaData: '',
    motivo: '',
    responsavel: RESPONSAVEIS[0] || 'Secretária'
  });

  const [erro, setErro] = useState('');

  const handleSubmit = () => {
    if (!form.novaData) {
      setErro('Por favor, informe a nova data de depósito.');
      return;
    }
    onRenovar(form);
    onClose();
  };

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErro('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📅 Nova Data de Depósito">
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Processo: <strong>{processo.cliente}</strong>
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Data anterior: <strong>{fmtData(processo.dataPrevistaDeposito)}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 700, color: 'var(--accent)' }}>Nova Data *</label>
          <input 
            type="date" 
            className="form-control" 
            value={form.novaData} 
            onChange={e => update('novaData', e.target.value)} 
            style={{ borderColor: 'var(--accent)', fontSize: '1.1rem', fontWeight: 700 }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Motivo</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Ex: secretaria informou novo prazo" 
            value={form.motivo} 
            onChange={e => update('motivo', e.target.value)} 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Responsável</label>
          <select 
            className="form-control" 
            value={form.responsavel} 
            onChange={e => update('responsavel', e.target.value)}
          >
            {RESPONSAVEIS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {erro && (
          <div style={{ color: 'var(--danger-text)', fontSize: '0.75rem', fontWeight: 600 }}>
            ⚠️ {erro}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-accent" onClick={handleSubmit} style={{ fontWeight: 700 }}>
            Definir Nova Data
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default ModalRenovacao;
