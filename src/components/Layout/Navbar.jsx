import React from 'react';
import { BarChart3, FolderOpen, PiggyBank, FileText } from 'lucide-react';

export const Navbar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'painel', label: 'Painel de Controle', icon: BarChart3 },
    { id: 'processos', label: 'Gestão de Processos', icon: FolderOpen },
    { id: 'depositos', label: 'Controle de Depósitos', icon: PiggyBank },
    { id: 'relatorios', label: 'Relatórios', icon: FileText }
  ];

  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      marginBottom: '1.5rem',
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onTabChange(tab.id)}
            style={{
              flexShrink: 0,
              border: isActive ? 'none' : '1px solid var(--border-color)',
              fontWeight: 600
            }}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
export default Navbar;
