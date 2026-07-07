export const SITUACOES_ALVARA = [
  "Aguardando petição de levantamento",
  "Petição de levantamento protocolada",
  "Aguardando manifestação da parte contrária",
  "Aguardando decisão judicial",
  "Decisão autorizando levantamento",
  "Aguardando expedição de alvará",
  "Alvará expedido",
  "Aguardando assinatura do juiz",
  "Aguardando envio ao banco",
  "Aguardando transferência pela secretaria",
  "Transferência solicitada",
  "Aguardando pagamento",
  "Pago parcialmente",
  "Pago integralmente",
  "Exigência documental",
  "Erro nos dados bancários",
  "Necessário contato com secretaria",
  "Necessário balcão virtual",
  "Parado há mais de 15 dias",
  "Parado há mais de 30 dias",
  "Revisar com urgência",
  "Arquivado"
];

export const STATUS_FINAL = [
  "Pendente",
  "Em análise",
  "Alvará expedido",
  "Transferência solicitada",
  "Pago",
  "Arquivado",
  "Revisar"
];

export const TIPOS_CREDITO = [
  "Honorários contratuais",
  "Honorários sucumbenciais",
  "Crédito do cliente",
  "Acordo",
  "RPV",
  "Precatório",
  "Restituição",
  "Outro"
];

export const TIPOS_PARTE_CONTRARIA = [
  "Fazenda Pública",
  "Município",
  "Estado",
  "INSS",
  "Banco",
  "Empresa Privada",
  "Pessoa Física",
  "Outro"
];

export const SISTEMAS = [
  "PJe",
  "e-SAJ",
  "Projudi",
  "eproc",
  "SEEU",
  "SEI",
  "Outro"
];

export const MEIOS_CONTATO = [
  "Balcão Virtual",
  "Telefone",
  "E-mail",
  "WhatsApp",
  "Presencial",
  "Outro"
];

export const RESPONSAVEIS = [
  "Secretária",
  "Felipe",
  "José Maurício Pontin",
  "Wanessa Cristina",
  "Outro"
];

export const PROCESSO_VAZIO = {
  id: null,
  numero: "",
  cliente: "",
  parte_contraria: "",
  tipo_parte_contraria: "",
  comarca: "",
  vara: "",
  sistema: "PJe",
  link_processo: "",
  tipo_credito: "",
  valor_previsto: "",
  valor_recebido: "0",
  situacao_alvara: "",
  ultima_movimentacao: "",
  data_ultima_movimentacao: "",
  proxima_providencia: "",
  data_nova_analise: "",
  responsavel: "",
  prioridade: "Média",
  observacoes: "",
  link_drive: "",
  documentos_pendentes: "",
  data_ultimo_contato: "",
  meio_contato: "",
  resultado_contato: "",
  proxima_acao: "",
  status_final: "Pendente",
  data_prevista_deposito: "",
  deposito_confirmado: false,
  alerta_deposito_enviado: false,
  data_deposito_anterior: "",
  historico_contatos: [],
  historico_renovacoes: []
};
