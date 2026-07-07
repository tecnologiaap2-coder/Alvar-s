import { supabase } from '../lib/supabase';
import { agora, formatBRL, fmtData, parseBRL } from './formatters';

export function montarCorpo(proc, operacao, usuarioEmail) {
  return `NOTIFICAÇÃO: ${operacao} — ARÔSO & PONTIN ADVOGADOS ASSOCIADOS
Protocolo: PROT-${proc.id}-${Date.now().toString().slice(-4)}
Data/Hora: ${agora()}
Operação: ${operacao}
Alterado por: ${usuarioEmail || "Não identificado"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DADOS DO PROCESSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cliente: ${proc.cliente}
Processo (CNJ): ${proc.numero}
Comarca: ${proc.comarca}
Vara/Secretaria: ${proc.vara}
Sistema: ${proc.sistema || "Não informado"}
Parte Contrária: ${proc.parteContraria || "Não informado"} (${proc.tipoParteContraria || "—"})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFORMAÇÕES FINANCEIRAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tipo de Crédito: ${proc.tipoCredito}
Valor Previsto: ${formatBRL(proc.valorPrevisto)}
Valor Recebido: ${formatBRL(proc.valorRecebido)}
Valor Pendente: ${formatBRL(parseBRL(proc.valorPrevisto) - parseBRL(proc.valorRecebido))}
${proc.dataPrevistaDeposito ? "Data Prevista de Depósito: " + fmtData(proc.dataPrevistaDeposito) : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SITUAÇÃO ATUAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Situação do Alvará: ${proc.situacaoAlvara}
Status Final: ${proc.statusFinal}
Prioridade: ${proc.prioridade || "Média"}
Responsável: ${proc.responsavel}
Última Movimentação: ${proc.ultimaMovimentacao || "—"} (${fmtData(proc.dataUltimaMovimentacao)})
Data para Nova Análise: ${fmtData(proc.dataNovaAnalise)}
Próxima Providência: ${proc.proximaProvidencia || "—"}
${proc.documentosPendentes ? "Documentos Pendentes: " + proc.documentosPendentes : ""}
${proc.observacoes ? "Observações: " + proc.observacoes : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${proc.linkProcesso ? "Link do Processo: " + proc.linkProcesso : "Link do Processo: Não informado"}
${proc.linkDrive ? "Pasta no Drive: " + proc.linkDrive : "Pasta no Drive: Não informada"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Notificação gerada automaticamente pelo sistema de controle de alvarás.
Arôso & Pontin Advogados Associados — São Luís/MA`;
}

export async function dispararEmailProtocolo(assunto, corpo) {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { assunto, corpo }
  });
  if (error) {
    console.error('Erro ao chamar Edge Function send-email:', error);
    throw error;
  }
  return data;
}

export async function dispararEventoCalendar(titulo, dataEvento, descricao) {
  const { data, error } = await supabase.functions.invoke('calendar-event', {
    body: { action: 'upsert', titulo, data: dataEvento, descricao }
  });
  if (error) {
    console.error('Erro ao chamar Edge Function calendar-event (upsert):', error);
    throw error;
  }
  return data;
}

export async function removerEventoCalendar(proc) {
  const { data, error } = await supabase.functions.invoke('calendar-event', {
    body: { action: 'delete', query: `${proc.numero} ${proc.cliente}` }
  });
  if (error) {
    console.error('Erro ao chamar Edge Function calendar-event (delete):', error);
    throw error;
  }
  return data;
}
