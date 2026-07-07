import { parseBRL } from "./formatters";

export const diasDesde = (d) => {
  if (!d) return 999;
  try {
    const dateStr = d.includes("T") ? d.split("T")[0] : d;
    const dt = new Date(dateStr + "T00:00:00");
    const h = new Date();
    h.setHours(0, 0, 0, 0);
    return Math.floor((h - dt) / 86400000);
  } catch (e) {
    return 999;
  }
};

export const prazoExpirado = (d) => {
  return d ? diasDesde(d) > 0 : false;
};

export const calcPrioridade = (p) => {
  if (parseBRL(p.valorPrevisto) > 10000) return "Alta";
  if (p.situacaoAlvara === "Exigência documental") return "Alta";
  if (p.situacaoAlvara === "Erro nos dados bancários") return "Alta";
  if (diasDesde(p.dataUltimaMovimentacao) > 30) return "Alta";
  return p.prioridade || "Média";
};

export const corStatus = (p) => {
  if (p.situacaoAlvara === "Pago integralmente" || p.statusFinal === "Pago") return "#1a7a4a";
  if (p.situacaoAlvara === "Arquivado" || p.statusFinal === "Arquivado") return "#6b7280";
  if (p.situacaoAlvara === "Alvará expedido" || p.statusFinal === "Alvará expedido") return "#1d4ed8";
  if (prazoExpirado(p.dataNovaAnalise) || calcPrioridade(p) === "Alta") return "#dc2626";
  const d = p.dataNovaAnalise ? diasDesde(p.dataNovaAnalise) : -999;
  if (d >= -2 && d <= 0) return "#ea580c";
  return "#ca8a04";
};

export const badgeStatus = (p) => {
  if (p.situacaoAlvara === "Pago integralmente" || p.statusFinal === "Pago") {
    return { bg: "#dcfce7", fg: "#166534", label: "Pago" };
  }
  if (p.situacaoAlvara === "Arquivado" || p.statusFinal === "Arquivado") {
    return { bg: "#f3f4f6", fg: "#374151", label: "Arquivado" };
  }
  if (p.situacaoAlvara === "Alvará expedido" || p.statusFinal === "Alvará expedido") {
    return { bg: "#dbeafe", fg: "#1e40af", label: "Expedido" };
  }
  if (prazoExpirado(p.dataNovaAnalise)) {
    return { bg: "#fee2e2", fg: "#991b1b", label: "Vencido" };
  }
  const d = p.dataNovaAnalise ? diasDesde(p.dataNovaAnalise) : -999;
  if (d >= -2 && d <= 0) {
    return { bg: "#ffedd5", fg: "#9a3412", label: "Urgente" };
  }
  return { bg: "#fef9c3", fg: "#854d0e", label: "Aguardando" };
};

export const statusDeposito = (p) => {
  if (!p.dataPrevistaDeposito) return null;
  if (p.depositoConfirmado) {
    return { cor: "#1a7a4a", bg: "#dcfce7", label: "✅ Depósito confirmado" };
  }
  const d = diasDesde(p.dataPrevistaDeposito);
  if (d > 0) {
    return { cor: "#dc2626", bg: "#fee2e2", label: "⚠️ Depósito " + d + "d em atraso" };
  }
  if (d === 0) {
    return { cor: "#ea580c", bg: "#ffedd5", label: "🔔 Depósito é HOJE" };
  }
  return { cor: "#1d4ed8", bg: "#dbeafe", label: "📅 Depósito em " + Math.abs(d) + "d" };
};
