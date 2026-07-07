export const hoje = () => {
  return new Date().toISOString().split("T")[0];
};

export const formatBRL = (v) => {
  if (v === undefined || v === null || v === "") return "R$ 0,00";
  const cleanVal = String(v).replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(cleanVal) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const parseBRL = (v) => {
  if (v === undefined || v === null || v === "") return 0;
  if (typeof v === "number") return v;
  
  // Se já for decimal formatado com ponto e vírgula
  const cleaned = String(v)
    .replace(/[^\d,.-]/g, "") // Remove tudo exceto dígitos, vírgula, ponto e sinal de menos
    .replace(/\./g, "")       // Remove pontos de milhares
    .replace(",", ".");       // Substitui vírgula decimal por ponto

  return parseFloat(cleaned) || 0;
};

export const fmtData = (d) => {
  if (!d) return "—";
  try {
    // Evita problemas de timezone instanciando com T00:00:00
    const dateStr = d.includes("T") ? d.split("T")[0] : d;
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR");
  } catch (e) {
    return "—";
  }
};

export const agora = () => {
  return new Date().toLocaleString("pt-BR");
};
