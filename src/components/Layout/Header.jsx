import React, { useState, useEffect } from 'react';
import { Sun, Moon, LogOut, User } from 'lucide-react';

export const Header = ({ user, onLogout }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="glass-panel" style={{
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      marginBottom: '1.5rem',
      borderTop: 'none'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
          Arôso & Pontin
        </h1>
        <span style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Advogados Associados
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className="btn btn-secondary btn-icon" 
          onClick={toggleTheme}
          title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
          style={{ border: 'none', background: 'transparent' }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }} className="mobile-hide">
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.email.split('@')[0]}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Membro do Escritório</span>
              </div>
            </div>

            <button 
              className="btn btn-danger btn-sm" 
              onClick={onLogout}
              style={{ padding: '0.5rem 0.75rem' }}
            >
              <LogOut size={14} />
              <span className="mobile-hide">Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
