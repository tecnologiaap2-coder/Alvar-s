import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useProcessos } from './hooks/useProcessos';
import { useToast } from './hooks/useToast';
import { Header } from './components/Layout/Header';
import { Navbar } from './components/Layout/Navbar';
import { LoginPage } from './components/Auth/LoginPage';
import { PainelPage } from './components/Painel/PainelPage';
import { ProcessosPage } from './components/Processos/ProcessosPage';
import { DepositosPage } from './components/Depositos/DepositosPage';
import { RelatoriosPage } from './components/Relatorios/RelatoriosPage';
import { ModalProcesso } from './components/Processos/ModalProcesso';
import { ModalHistorico } from './components/Processos/ModalHistorico';
import { ModalRenovacao } from './components/Depositos/ModalRenovacao';
import { ConfirmDialog } from './components/shared/ConfirmDialog';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { PROCESSO_VAZIO } from './lib/constants';
import { hoje, formatBRL, fmtData } from './utils/formatters';
import { agora } from './utils/formatters';
import { diasDesde } from './utils/calculations';
import { 
  montarCorpo, 
  dispararEmailProtocolo, 
  dispararEventoCalendar, 
  removerEventoCalendar 
} from './utils/email';

export default function App() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const { 
    processos, 
    carregando: processosLoading, 
    salvarProcessoDB, 
    excluirProcessoDB, 
    registrarContatoDB, 
    registrarRenovacaoDB, 
    confirmarDepositoDB, 
    marcarAlertaEnviadoDB 
  } = useProcessos(user);
  const { showToast } = useToast();

  // Estados locais de interface
  const [aba, setAba] = useState('painel');
  const [processoDetalhe, setProcessoDetalhe] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [processoEditando, setProcessoEditando] = useState(null);
  const [modalHistorico, setModalHistorico] = useState(null);
  const [modalRenovacao, setModalRenovacao] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const [enviando, setEnviando] = useState(false);
  const [logEnvios, setLogEnvios] = useState([]);

  // Histórico de envios de e-mail na sessão
  const addLog = (msg) => {
    setLogEnvios(l => [
      { ts: new Date().toLocaleTimeString('pt-BR'), msg },
      ...l
    ].slice(0, 50));
  };

  // ── DISPARO DE PROTOCOLO CENTRAL (EMAIL + CALENDAR) ──────────────────────────
  const dispararProtocolo = async (proc, operacao) => {
    const assunto = `[${operacao}] Alvará — ${proc.cliente} — Proc. ${proc.numero}`;
    const corpo = montarCorpo(proc, operacao, user?.email);
    setEnviando(true);
    addLog(`📧 Iniciando envio de protocolo: ${operacao}`);
    
    // 1. Enviar email via backend Edge Function
    try {
      await dispararEmailProtocolo(assunto, corpo);
      addLog(`✅ E-mail enviado com sucesso`);
      showToast(`📧 Protocolo enviado: ${operacao} ✓`);
    } catch (e) {
      console.error(e);
      addLog(`❌ Falha ao enviar e-mail: ${e.message}`);
      showToast(`⚠️ Falha ao enviar protocolo de e-mail`, 'warn');
    }

    // 2. Criar evento no Google Calendar
    if (['CADASTRADO', 'ATUALIZADO', 'NOVA DATA DE DEPÓSITO', 'DEPÓSITO CONFIRMADO'].includes(operacao)) {
      const dataEvento = proc.dataPrevistaDeposito || proc.dataNovaAnalise || hoje();
      const titulo = `[${operacao}] ${proc.cliente} — Proc. ${proc.numero}`;
      const desc = `Operação: ${operacao}\nCliente: ${proc.cliente}\nProcesso: ${proc.numero}\nVara: ${proc.vara} — ${proc.comarca}\nValor: ${formatBRL(proc.valorPrevisto)}\nSituação: ${proc.situacaoAlvara}\nProvidência: ${proc.proximaProvidencia || '—'}\nResponsável: ${proc.responsavel}`;
      
      try {
        await dispararEventoCalendar(titulo, dataEvento, desc);
        addLog(`✅ Evento criado no Google Calendar`);
      } catch (e) {
        console.error(e);
        addLog(`❌ Falha ao criar evento no Calendar: ${e.message}`);
      }
    }
    
    setEnviando(false);
  };

  // ── AÇÕES CRUD DE FRONTEND ──────────────────────────────────────────────────
  const handleSalvarProcesso = async (dados, dataDepositoAlterada) => {
    try {
      const ehNovo = !dados.id;
      const salvo = await salvarProcessoDB(dados);
      setModalAberto(false);
      setProcessoEditando(null);

      // Dispara fluxos de e-mail e calendário
      await dispararProtocolo(salvo, ehNovo ? 'CADASTRADO' : 'ATUALIZADO');
      if (dataDepositoAlterada && salvo.dataPrevistaDeposito) {
        await dispararProtocolo(salvo, 'NOVA DATA DE DEPÓSITO');
      }

      // Atualiza detalhe selecionado se for o mesmo processo
      if (processoDetalhe?.id === salvo.id) {
        setProcessoDetalhe(salvo);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExcluirProcesso = async (id) => {
    const proc = processos.find(p => p.id === id);
    if (!proc) return;

    try {
      setEnviando(true);
      await excluirProcessoDB(id);
      setConfirmDelete(null);
      setProcessoDetalhe(null);

      const assunto = `[PROCESSO EXCLUÍDO] Alvará — ${proc.cliente} — Proc. ${proc.numero}`;
      const corpo = `NOTIFICAÇÃO DE EXCLUSÃO — ARÔSO & PONTIN ADVOGADOS ASSOCIADOS
Protocolo: PROT-EXCL-${proc.id}-${Date.now().toString().slice(-4)}
Data/Hora: ${agora()}
Operação: PROCESSO EXCLUÍDO DO SISTEMA
Excluído por: ${user?.email || "Não identificado"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DADOS DO PROCESSO EXCLUÍDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cliente: ${proc.cliente}
Processo (CNJ): ${proc.numero}
Comarca: ${proc.comarca}  |  Vara: ${proc.vara}
Tipo de Crédito: ${proc.tipoCredito}
Valor Previsto: ${formatBRL(proc.valorPrevisto)}
Situação: ${proc.situacaoAlvara}
Responsável: ${proc.responsavel}
Cadastrado em: ${fmtData(proc.criadoEm)}
${proc.dataPrevistaDeposito ? "Data Prevista Depósito: " + fmtData(proc.dataPrevistaDeposito) : ""}

Os eventos correspondentes no Google Calendar foram removidos.
Arôso & Pontin Advogados Associados — São Luís/MA`;

      addLog(`🗑️ Enviando notificação de exclusão — ${proc.numero}`);
      try {
        await dispararEmailProtocolo(assunto, corpo);
        addLog(`✅ E-mail de exclusão enviado`);
      } catch (e) {
        addLog(`❌ Falha no e-mail de exclusão: ${e.message}`);
      }

      try {
        await removerEventoCalendar(proc);
        addLog(`✅ Eventos do Calendar removidos`);
      } catch (e) {
        addLog(`❌ Falha ao remover eventos do Calendar: ${e.message}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnviando(false);
    }
  };

  const handleConfirmarDeposito = async (proc) => {
    try {
      const salvo = await confirmarDepositoDB(proc);
      setProcessoDetalhe(salvo);
      await dispararProtocolo(salvo, 'DEPÓSITO CONFIRMADO');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenovarDeposito = async (formRenovacao) => {
    if (!modalRenovacao) return;
    try {
      const salvo = await registrarRenovacaoDB(modalRenovacao.id, modalRenovacao.dataPrevistaDeposito, formRenovacao);
      setModalRenovacao(null);
      if (salvo) {
        setProcessoDetalhe(salvo);
        await dispararProtocolo(salvo, 'NOVA DATA DE DEPÓSITO');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdicionarHistorico = async (formContato) => {
    if (!modalHistorico) return;
    try {
      const salvo = await registrarContatoDB(modalHistorico.id, formContato);
      setModalHistorico(null);
      if (salvo) {
        setProcessoDetalhe(salvo);
        await dispararProtocolo(salvo, 'CONTATO REGISTRADO');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnviarAlertaVencimento = async (proc) => {
    const atraso = diasDesde(proc.dataPrevistaDeposito);
    const assunto = `🚨 DEPÓSITO VENCIDO — ${proc.cliente} — Proc. ${proc.numero}`;
    const corpo = `ALERTA: DEPÓSITO VENCIDO — ARÔSO & PONTIN ADVOGADOS ASSOCIADOS
Data/Hora: ${agora()}
Disparado por: ${user?.email || "Não identificado"}

A data prevista para depósito ${atraso === 0 ? "é HOJE" : "venceu há " + atraso + " dia(s)"}.

Cliente: ${proc.cliente}
Processo: ${proc.numero}
Comarca/Vara: ${proc.comarca} — ${proc.vara}
Valor Previsto: ${formatBRL(proc.valorPrevisto)}
Data prevista: ${fmtData(proc.dataPrevistaDeposito)}
${atraso > 0 ? "Dias em atraso: " + atraso : ""}
Situação: ${proc.situacaoAlvara}
Responsável: ${proc.responsavel}

AÇÃO NECESSÁRIA:
✅ Se o depósito FOI realizado: confirmar no sistema.
❌ Se NÃO foi: registrar nova data e contatar a vara/secretaria.`;

    setEnviando(true);
    addLog(`🚨 Disparando alerta de vencimento — ${proc.numero}`);
    try {
      await dispararEmailProtocolo(assunto, corpo);
      await marcarAlertaEnviadoDB(proc.id);
      addLog(`✅ Alerta de vencimento enviado`);
      showToast('🚨 Alerta de vencimento enviado ✓', 'warn');
    } catch (e) {
      console.error(e);
      addLog(`❌ Falha no e-mail de vencimento: ${e.message}`);
      showToast('Falha ao enviar alerta', 'error');
    } finally {
      setEnviando(false);
    }
  };

  const handleEnviarAlertaManual = async (proc) => {
    const assunto = `ALERTA DE ALVARÁ PENDENTE — ${proc.cliente} — ${proc.numero}`;
    const corpo = `ALERTA: ALVARÁ PENDENTE — ARÔSO & PONTIN ADVOGADOS ASSOCIADOS
Data/Hora: ${agora()}
Disparado por: ${user?.email || "Não identificado"}

Cliente: ${proc.cliente}
Processo: ${proc.numero}
Comarca/Vara: ${proc.comarca} — ${proc.vara}
Situação: ${proc.situacaoAlvara}
Última movimentação (${fmtData(proc.dataUltimaMovimentacao)}): ${proc.ultimaMovimentacao || "—"}
Próxima Providência: ${proc.proximaProvidencia || "—"}
Responsável: ${proc.responsavel}

Orientação: entrar em contato com a secretaria pelo balcão virtual.`;

    setEnviando(true);
    addLog(`📧 Disparando alerta manual — ${proc.numero}`);
    try {
      await dispararEmailProtocolo(assunto, corpo);
      addLog(`✅ Alerta manual enviado com sucesso`);
      showToast('📧 Alerta de e-mail enviado ✓');
    } catch (e) {
      console.error(e);
      addLog(`❌ Falha ao enviar alerta manual: ${e.message}`);
      showToast('Falha ao enviar alerta', 'error');
    } finally {
      setEnviando(false);
    }
  };

  const handleCriarEventoManual = async (proc) => {
    setEnviando(true);
    const titulo = `Verificar alvará — ${proc.cliente} — Proc. ${proc.numero}`;
    const desc = `Situação: ${proc.situacaoAlvara}\nÚltima mov.: ${proc.ultimaMovimentacao} (${fmtData(proc.dataUltimaMovimentacao)})\nProvidência: ${proc.proximaProvidencia}\nResponsável: ${proc.responsavel}`;
    try {
      await dispararEventoCalendar(titulo, proc.dataNovaAnalise || hoje(), desc);
      addLog(`✅ Evento manual criado no Calendar`);
      showToast('📅 Evento criado no Calendar ✓');
    } catch (e) {
      console.error(e);
      addLog(`❌ Falha no Calendar manual: ${e.message}`);
      showToast('Falha ao criar evento', 'error');
    } finally {
      setEnviando(false);
    }
  };

  // ── CONTROLADORES DE INTERFACE DE LOGIN E CARREGAMENTO ───────────────────────
  if (authLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner label="Autenticando sessão..." />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <Header user={null} />
        <LoginPage onLogin={login} />
      </>
    );
  }

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      <Header user={user} onLogout={logout} />
      
      <main className="main-content">
        <Navbar activeTab={aba} onTabChange={setAba} />

        {processosLoading && processos.length === 0 ? (
          <LoadingSpinner label="Carregando banco de dados..." />
        ) : (
          <>
            {aba === 'painel' && (
              <PainelPage 
                processos={processos} 
                onSelectProcesso={(p) => { setProcessoDetalhe(p); setAba('processos'); }}
                onNavigate={setAba}
              />
            )}

            {aba === 'processos' && (
              <ProcessosPage
                processos={processos}
                processoDetalhe={processoDetalhe}
                setProcessoDetalhe={setProcessoDetalhe}
                onOpenNovoProcesso={() => { setProcessoEditando({ ...PROCESSO_VAZIO }); setModalAberto(true); }}
                onEdit={(p) => { setProcessoEditando({ ...p }); setModalAberto(true); }}
                onConfirmarDeposito={handleConfirmarDeposito}
                onNovaDataDeposito={(p, alertaDireto) => {
                  if (alertaDireto) {
                    handleEnviarAlertaVencimento(p);
                  } else {
                    setModalRenovacao(p);
                  }
                }}
                onRegistrarContato={(p) => setModalHistorico(p)}
                onCriarEventoCalendar={handleCriarEventoManual}
                onEnviarAlertaManual={handleEnviarAlertaManual}
                onExcluir={(id) => setConfirmDelete(id)}
                enviando={enviando}
              />
            )}

            {aba === 'depositos' && (
              <DepositosPage
                processos={processos}
                onConfirmar={handleConfirmarDeposito}
                onRenovar={(p) => setModalRenovacao(p)}
                onAlertar={handleEnviarAlertaVencimento}
                enviando={enviando}
              />
            )}

            {aba === 'relatorios' && (
              <RelatoriosPage
                processos={processos}
                logEnvios={logEnvios}
                onClearLogs={() => setLogEnvios([])}
              />
            )}
          </>
        )}
      </main>

      {/* MODAL: CADASTRO/EDIÇÃO */}
      {modalAberto && processoEditando && (
        <ModalProcesso
          processo={processoEditando}
          onSalvar={handleSalvarProcesso}
          onFechar={() => { setModalAberto(false); setProcessoEditando(null); }}
        />
      )}

      {/* MODAL: HISTÓRICO DE CONTATOS */}
      {modalHistorico && (
        <ModalHistorico
          isOpen={true}
          onClose={() => setModalHistorico(null)}
          onRegistrar={handleAdicionarHistorico}
          cliente={modalHistorico.cliente}
        />
      )}

      {/* MODAL: RENOVAÇÃO DE DATA DE DEPÓSITO */}
      {modalRenovacao && (
        <ModalRenovacao
          isOpen={true}
          onClose={() => setModalRenovacao(null)}
          onRenovar={handleRenovarDeposito}
          processo={modalRenovacao}
        />
      )}

      {/* DIÁLOGO: CONFIRMAR EXCLUSÃO */}
      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Confirmar exclusão?"
        message="Esta ação é permanente e removerá o processo e todos os seus históricos associados do banco de dados do escritório."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={() => handleExcluirProcesso(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}
