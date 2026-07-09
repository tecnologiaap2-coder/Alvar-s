import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';
import { parseBRL } from '../utils/formatters';

// Mapeamento de Banco de Dados (snake_case) para Frontend (camelCase)
export const mapDBToFrontend = (db) => {
  if (!db) return null;
  return {
    id: db.id,
    numero: db.numero,
    cliente: db.cliente,
    parteContraria: db.parte_contraria,
    tipoParteContraria: db.tipo_parte_contraria,
    comarca: db.comarca,
    vara: db.vara,
    sistema: db.sistema,
    linkProcesso: db.link_processo,
    tipoCredito: db.tipo_credito,
    valorPrevisto: db.valor_previsto,
    valorRecebido: db.valor_recebido,
    situacaoAlvara: db.situacao_alvara,
    ultimaMovimentacao: db.ultima_movimentacao,
    dataUltimaMovimentacao: db.data_ultima_movimentacao,
    proximaProvidencia: db.proxima_providencia,
    dataNovaAnalise: db.data_nova_analise,
    responsavel: db.responsavel,
    prioridade: db.prioridade,
    observacoes: db.observacoes,
    linkDrive: db.link_drive,
    documentosPendentes: db.documentos_pendentes,
    dataUltimoContato: db.data_ultimo_contato,
    meioContato: db.meio_contato,
    resultadoContato: db.resultado_contato,
    proximaAcao: db.proxima_acao,
    statusFinal: db.status_final,
    dataPrevistaDeposito: db.data_prevista_deposito,
    depositoConfirmado: db.deposito_confirmado,
    alertaDepositoEnviado: db.alerta_deposito_enviado,
    dataDepositoAnterior: db.data_deposito_anterior,
    criadoEm: db.criado_em,
    atualizadoEm: db.atualizado_em,
    userId: db.user_id,
    historico: (db.historico_contatos || []).map(hc => ({
      id: hc.id,
      processoId: hc.processo_id,
      data: hc.data,
      responsavel: hc.responsavel,
      meio: hc.meio,
      setor: hc.setor,
      resposta: hc.resposta,
      proximaProvidencia: hc.proxima_providencia,
      novaData: hc.nova_data,
      criadoEm: hc.criado_em
    })).sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)),
    historicoRenovacoes: (db.historico_renovacoes || []).map(hr => ({
      id: hr.id,
      processoId: hr.processo_id,
      dataAnterior: hr.data_anterior,
      novaData: hr.nova_data,
      motivo: hr.motivo,
      responsavel: hr.responsavel,
      registradoEm: hr.registrado_em
    })).sort((a, b) => new Date(b.registradoEm) - new Date(a.registradoEm))
  };
};

// Mapeamento de Frontend (camelCase) para Banco de Dados (snake_case)
export const mapFrontendToDB = (fe) => {
  if (!fe) return null;
  return {
    numero: fe.numero,
    cliente: fe.cliente,
    parte_contraria: fe.parteContraria || null,
    tipo_parte_contraria: fe.tipoParteContraria || null,
    comarca: fe.comarca,
    vara: fe.vara,
    sistema: fe.sistema || null,
    link_processo: fe.linkProcesso || null,
    tipo_credito: fe.tipoCredito,
    valor_previsto: parseBRL(fe.valorPrevisto),
    valor_recebido: parseBRL(fe.valorRecebido),
    situacao_alvara: fe.situacaoAlvara,
    ultima_movimentacao: fe.ultimaMovimentacao || null,
    data_ultima_movimentacao: fe.dataUltimaMovimentacao,
    proxima_providencia: fe.proximaProvidencia,
    data_nova_analise: fe.dataNovaAnalise,
    responsavel: fe.responsavel,
    prioridade: fe.prioridade || 'Média',
    observacoes: fe.observacoes || null,
    link_drive: fe.linkDrive || null,
    documentos_pendentes: fe.documentosPendentes || null,
    data_ultimo_contato: fe.dataUltimoContato || null,
    meio_contato: fe.meioContato || null,
    resultado_contato: fe.resultadoContato || null,
    proxima_acao: fe.proximaAcao || null,
    status_final: fe.statusFinal || 'Pendente',
    data_prevista_deposito: fe.dataPrevistaDeposito || null,
    deposito_confirmado: !!fe.depositoConfirmado,
    alerta_deposito_enviado: !!fe.alertaDepositoEnviado,
    data_deposito_anterior: fe.dataDepositoAnterior || null,
  };
};

export const useProcessos = (user) => {
  const [processos, setProcessos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { showToast } = useToast();

  const carregarProcessos = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('processos')
        .select(`
          *,
          historico_contatos(*),
          historico_renovacoes(*)
        `)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setProcessos((data || []).map(mapDBToFrontend));
    } catch (e) {
      console.error(e);
      showToast('Erro ao carregar processos: ' + e.message, 'error');
    } finally {
      setCarregando(false);
    }
  };

  // Carrega inicialmente
  useEffect(() => {
    if (!user) {
      setProcessos([]);
      setCarregando(false);
      return;
    }

    carregarProcessos();

    // Configura escuta realtime
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'processos' }, () => {
        carregarProcessos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'historico_contatos' }, () => {
        carregarProcessos();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'historico_renovacoes' }, () => {
        carregarProcessos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Salvar/Editar Processo
  const salvarProcessoDB = async (processoData) => {
    try {
      const payload = mapFrontendToDB(processoData);
      
      if (processoData.id) {
        // Atualização
        const { data, error } = await supabase
          .from('processos')
          .update(payload)
          .eq('id', processoData.id)
          .select();
        
        if (error) throw error;
        showToast('Processo atualizado com sucesso!');
        return mapDBToFrontend(data[0]);
      } else {
        // Criação
        const { data, error } = await supabase
          .from('processos')
          .insert(payload)
          .select();
          
        if (error) throw error;
        showToast('Processo cadastrado com sucesso!');
        return mapDBToFrontend(data[0]);
      }
    } catch (e) {
      console.error(e);
      showToast('Erro ao salvar processo: ' + e.message, 'error');
      throw e;
    }
  };

  // Excluir Processo
  const excluirProcessoDB = async (id) => {
    try {
      const { error } = await supabase
        .from('processos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Processo excluído com sucesso!', 'warn');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Erro ao excluir processo: ' + e.message, 'error');
      throw e;
    }
  };

  // Adicionar Histórico de Contato
  const registrarContatoDB = async (processoId, historicoData) => {
    try {
      const payload = {
        processo_id: processoId,
        data: historicoData.data,
        responsavel: historicoData.responsavel,
        meio: historicoData.meio,
        setor: historicoData.setor || null,
        resposta: historicoData.resposta || null,
        proxima_providencia: historicoData.proximaProvidencia || null,
        nova_data: historicoData.novaData || null
      };

      const { data, error } = await supabase
        .from('historico_contatos')
        .insert(payload)
        .select();

      if (error) throw error;

      // Também atualiza dados de contato no processo correspondente
      const updates = {
        data_ultimo_contato: historicoData.data,
        meio_contato: historicoData.meio,
        resultado_contato: historicoData.resposta || null,
        proxima_acao: historicoData.proximaProvidencia || null,
      };

      if (historicoData.novaData) {
        updates.data_nova_analise = historicoData.novaData;
      }

      const { error: updateError } = await supabase
        .from('processos')
        .update(updates)
        .eq('id', processoId);

      if (updateError) throw updateError;
      showToast('Contato registrado com sucesso!');
      return data[0];
    } catch (e) {
      console.error(e);
      showToast('Erro ao registrar contato: ' + e.message, 'error');
      throw e;
    }
  };

  // Registrar Renovação de Depósito
  const registrarRenovacaoDB = async (processoId, dataAnterior, renovacaoData) => {
    try {
      const payload = {
        processo_id: processoId,
        data_anterior: dataAnterior,
        nova_data: renovacaoData.novaData,
        motivo: renovacaoData.motivo,
        responsavel: renovacaoData.responsavel
      };

      const { data, error } = await supabase
        .from('historico_renovacoes')
        .insert(payload)
        .select();

      if (error) throw error;

      // Atualiza a data prevista de depósito no processo
      const { error: updateError } = await supabase
        .from('processos')
        .update({
          data_prevista_deposito: renovacaoData.novaData,
          data_deposito_anterior: dataAnterior,
          alerta_deposito_enviado: false
        })
        .eq('id', processoId);

      if (updateError) throw updateError;
      showToast('Renovação de depósito registrada!');
      return data[0];
    } catch (e) {
      console.error(e);
      showToast('Erro ao registrar renovação: ' + e.message, 'error');
      throw e;
    }
  };

  // Confirmar Depósito/Pagamento
  const confirmarDepositoDB = async (processo) => {
    try {
      const { data, error } = await supabase
        .from('processos')
        .update({
          deposito_confirmado: true,
          situacao_alvara: 'Pago integralmente',
          status_final: 'Pago',
          valor_recebido: processo.valorPrevisto
        })
        .eq('id', processo.id)
        .select();

      if (error) throw error;
      showToast('Depósito confirmado com sucesso!');
      return mapDBToFrontend(data[0]);
    } catch (e) {
      console.error(e);
      showToast('Erro ao confirmar depósito: ' + e.message, 'error');
      throw e;
    }
  };

  // Atualizar sinalizador de alerta de vencimento de e-mail enviado
  const marcarAlertaEnviadoDB = async (processoId) => {
    try {
      const { error } = await supabase
        .from('processos')
        .update({ alerta_deposito_enviado: true })
        .eq('id', processoId);

      if (error) throw error;
    } catch (e) {
      console.error(e);
    }
  };

  return {
    processos,
    carregando,
    carregarProcessos,
    salvarProcessoDB,
    excluirProcessoDB,
    registrarContatoDB,
    registrarRenovacaoDB,
    confirmarDepositoDB,
    marcarAlertaEnviadoDB
  };
};
