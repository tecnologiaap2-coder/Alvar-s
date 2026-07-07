# 🤖 Contexto de Desenvolvimento - Sistema de Controle de Alvarás Judiciais

Este arquivo serve como o **Painel de Controle do Agente**. Ele deve ser lido no início de cada sessão e atualizado ao final de cada alteração relevante para manter o histórico, decisões técnicas e o estado atual do projeto.

---

## 📌 Visão Geral do Projeto

O **Sistema de Controle de Alvarás Judiciais** é uma aplicação para o escritório **Arôso & Pontin Advogados Associados** (São Luís/MA) para gerenciar processos judiciais, depósitos judiciais vinculados e emitir protocolos automáticos de alteração de dados via email e eventos no calendário do Google.

*   **Arquitetura Atual:** Aplicação modular React + Vite com backend Supabase (PostgreSQL + Auth + Edge Functions).
*   **Deploy:** Frontend na Vercel, Backend no Supabase.

---

## ⚙️ Especificações Técnicas e Decisões

1.  **Framework Frontend:** Vite 5 + React 18 (SPA). Sem migração para Next.js (decisão do cliente).
2.  **Estilização:** CSS Vanilla com variáveis CSS globais em `src/index.css` — tema light/dark, tipografia Inter, responsividade mobile-first, micro-animações, glassmorphism.
3.  **Banco de Dados & Backend:** Supabase (PostgreSQL com RLS habilitado). Schema em `supabase/migrations/001_initial_schema.sql`.
4.  **Autenticação:** Supabase Auth com login de e-mail/senha seguro.
5.  **Envio de E-mails:** SMTP Gmail via Supabase Edge Function `send-email` (credenciais nos Secrets, nunca no frontend).
6.  **Integração com Agenda:** Google Calendar via Supabase Edge Function `calendar-event` com Service Account JWT. Guia de configuração em `GUIA-GOOGLE-CALENDAR.md`.
7.  **Análise de Processo por IA:** Desativada temporariamente (chave Anthropic removida do frontend).
8.  **Ícones:** Lucide React (SVG profissional).
9.  **Notificações:** react-hot-toast com estilização customizada via hook `useToast`.

---

## 📂 Estrutura de Arquivos (Estado Atual)

```
alvaras-project/
├── public/
├── src/
│   ├── main.jsx                           ← Ponto de entrada
│   ├── App.jsx                            ← Router de abas + Auth guard + lógica de protocolos
│   ├── index.css                          ← Design system completo (CSS Variables, light/dark, responsivo)
│   │
│   ├── lib/
│   │   ├── supabase.js                    ← Cliente Supabase (env vars VITE_SUPABASE_*)
│   │   └── constants.js                   ← Enums, listas de opções, PROCESSO_VAZIO
│   │
│   ├── hooks/
│   │   ├── useAuth.js                     ← Login/logout/sessão via Supabase Auth
│   │   ├── useProcessos.js                ← CRUD com mapeamento camelCase↔snake_case + Realtime
│   │   └── useToast.js                    ← Wrapper do react-hot-toast com estilos
│   │
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx                 ← Barra superior + toggle tema + info do usuário
│   │   │   └── Navbar.jsx                 ← Navegação por abas (Painel, Processos, Depósitos, Relatórios)
│   │   ├── Auth/
│   │   │   └── LoginPage.jsx              ← Tela de login com validação
│   │   ├── Painel/
│   │   │   ├── PainelPage.jsx             ← Dashboard com métricas financeiras e lista de urgentes
│   │   │   └── MetricCard.jsx             ← Card individual de KPI
│   │   ├── Processos/
│   │   │   ├── ProcessosPage.jsx          ← Lista com filtros + sidebar de detalhes
│   │   │   ├── ProcessoCard.jsx           ← Card resumo na listagem
│   │   │   ├── ProcessoDetalhe.jsx        ← Painel lateral completo (depósito, ações, histórico)
│   │   │   ├── ModalProcesso.jsx          ← Formulário de cadastro/edição com validação
│   │   │   └── ModalHistorico.jsx         ← Registrar contato com secretaria
│   │   ├── Depositos/
│   │   │   ├── DepositosPage.jsx          ← Visão geral de depósitos (vencidos, próximos, confirmados)
│   │   │   ├── DepositoCard.jsx           ← Card com ações rápidas (confirmar, prorrogar, alertar)
│   │   │   └── ModalRenovacao.jsx         ← Nova data de depósito
│   │   ├── Relatorios/
│   │   │   └── RelatoriosPage.jsx         ← Tabela agrupada por 6 dimensões + log de envios
│   │   └── shared/
│   │       ├── Badge.jsx                  ← Badge de status reutilizável
│   │       ├── Modal.jsx                  ← Wrapper de modal genérico com glassmorphism
│   │       ├── ConfirmDialog.jsx          ← Diálogo de confirmação
│   │       ├── LoadingSpinner.jsx         ← Indicador de carregamento animado
│   │       └── EmptyState.jsx             ← Placeholder para listas vazias
│   │
│   └── utils/
│       ├── formatters.js                  ← formatBRL, fmtData, parseBRL, hoje, agora
│       ├── calculations.js                ← calcPrioridade, corStatus, badgeStatus, statusDeposito, diasDesde
│       └── email.js                       ← montarCorpo + chamadas às Edge Functions do Supabase
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql         ← Tabelas + triggers + RLS policies
│   └── functions/
│       ├── send-email/index.ts            ← Edge Function: envio SMTP Gmail
│       └── calendar-event/index.ts        ← Edge Function: CRUD Google Calendar (JWT + Service Account)
│
├── index.html
├── vite.config.js
├── vercel.json                            ← Configuração de SPA rewrite para Vercel
├── package.json
├── .env                                   ← Credenciais reais (NÃO commitar)
├── .env.example
├── .gitignore
├── README.md
├── PLANO-IMPLEMENTACAO.md
├── GUIA-GOOGLE-CALENDAR.md                ← Guia passo a passo para Google Calendar
├── GUIA-GMAIL-MCP.md                      ← Guia legado (MCP) — pode ser removido
└── claude.md                              ← Este arquivo
```

---

## 🗄️ Schema do Banco de Dados

3 tabelas com RLS habilitado. Políticas permitem acesso total a qualquer `authenticated` user (multiusuário não ativado):

| Tabela | Descrição |
|---|---|
| `processos` | Tabela principal (35+ colunas). Trigger `update_updated_at_column` auto-atualiza `atualizado_em`. |
| `historico_contatos` | Registros de contato com secretarias. FK cascade para `processos`. |
| `historico_renovacoes` | Log de renovações de datas de depósitos. FK cascade para `processos`. |

---

## 🔑 Variáveis de Ambiente

### `.env` local (já configurado)
```env
VITE_SUPABASE_URL=https://sqoigqkgkxbhxdyckadc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
GMAIL_USER=tecnologiaap2@gmail.com
GMAIL_APP_PASSWORD=etux mlrv volt wjwm
VITE_EMAIL_FELIPE=felipe@arosopontinadvogados.com.br
VITE_EMAIL_ESCRITORIO=escritorio@arosopontinadvogados.com.br
```

### Supabase Secrets (a configurar no painel Supabase)
```
GMAIL_USER=tecnologiaap2@gmail.com
GMAIL_APP_PASSWORD=etux mlrv volt wjwm
GOOGLE_CALENDAR_CREDENTIALS={"client_email":"...","private_key":"..."} (quando ativar Calendar real)
```

---

## 🔄 Mapeamento Frontend ↔ Banco

O hook `useProcessos.js` faz a conversão automática entre `camelCase` (frontend) e `snake_case` (PostgreSQL) via funções `mapDBToFrontend()` e `mapFrontendToDB()`. Qualquer adição de campo deve ser feita em ambas as direções.

---

## 📈 Progresso do Desenvolvimento

### Fase 0: Preparação e Planejamento ✅
*   [x] Leitura e análise do projeto original (App.jsx monolítico de 984 linhas).
*   [x] Criação do `claude.md`.
*   [x] Alinhamento das credenciais do Supabase com o usuário.

### Fase 1: Infraestrutura (Supabase) ✅
*   [x] Schema SQL criado (`001_initial_schema.sql`): 3 tabelas + trigger + RLS + políticas.
*   [x] `.env` normalizado com prefixo `VITE_`.

### Fase 2: Estrutura Base e Modularização ✅
*   [x] Dependências instaladas: `@supabase/supabase-js`, `react-router-dom`, `react-hot-toast`, `lucide-react`.
*   [x] Utilitários criados: `constants.js`, `formatters.js`, `calculations.js`.
*   [x] Cliente Supabase: `supabase.js`.
*   [x] Hooks: `useAuth.js`, `useProcessos.js`, `useToast.js`.

### Fase 3: Design System & CSS ✅
*   [x] `index.css` completo com CSS Variables, tema light/dark, tipografia Inter, micro-animações, responsividade, classes utilitárias.

### Fase 4: Componentização da Interface ✅
*   [x] Login (`LoginPage.jsx`), Layout (`Header.jsx`, `Navbar.jsx`), Shared (`Badge`, `Modal`, `ConfirmDialog`, `LoadingSpinner`, `EmptyState`).
*   [x] Painel (`PainelPage.jsx`, `MetricCard.jsx`).
*   [x] Processos (`ProcessosPage.jsx`, `ProcessoCard.jsx`, `ProcessoDetalhe.jsx`, `ModalProcesso.jsx`, `ModalHistorico.jsx`).
*   [x] Depósitos (`DepositosPage.jsx`, `DepositoCard.jsx`, `ModalRenovacao.jsx`).
*   [x] Relatórios (`RelatoriosPage.jsx`).
*   [x] `App.jsx` refatorado como orquestrador de abas, autenticação e protocolos.

### Fase 5: Edge Functions ✅
*   [x] `send-email/index.ts` — SMTP Gmail com SMTPClient Deno.
*   [x] `calendar-event/index.ts` — Google Calendar API com JWT Service Account + modo mock.
*   [x] `utils/email.js` — Integração frontend → Edge Functions.

### Fase 6: Deploy & Homologação ✅
*   [x] `vercel.json` criado.
*   [x] Build validado com sucesso (`npm run build` → 455 kB gzip 125 kB).

---

## ⚠️ Pendências e Próximos Passos

1.  **Deploy das Edge Functions:** Usar `supabase functions deploy send-email` e `supabase functions deploy calendar-event` (requer Supabase CLI instalado localmente e linkado ao projeto) para implantá-las no ambiente de nuvem do Supabase.
2.  **Deploy na Vercel:** Conectar o repositório Git do projeto ao painel da Vercel para deploy contínuo do frontend.
3.  **Google Calendar (opcional):** Seguir o [GUIA-GOOGLE-CALENDAR.md](file:///c:/Users/Aroso%20&%20Pontin%20Adv/Desktop/Tecnologia%20-%20Kayro/alvaras-project/GUIA-GOOGLE-CALENDAR.md) para ativar a integração de agenda real quando achar oportuno.


---

## 📝 Histórico de Interações (Log de Atividades)

*   **06/07/2026 — Sessão 1:**
    *   Leitura e auditoria do código-fonte legado (App.jsx monolítico de 984 linhas).
    *   Criação do arquivo de handover `claude.md`.
    *   Plano de implementação aprovado pelo usuário.
    *   **Execução completa de todas as 6 fases:**
        *   Fase 1: Schema SQL + .env normalizado.
        *   Fase 2: Dependências + utilitários + hooks + cliente Supabase.
        *   Fase 3: Design system premium com CSS Variables e light/dark mode.
        *   Fase 4: 20+ componentes React modulares criados.
        *   Fase 5: Edge Functions para Gmail SMTP e Google Calendar API.
        *   Fase 6: vercel.json + build validado com sucesso (455 kB / 125 kB gzip).
    *   Criação do `GUIA-GOOGLE-CALENDAR.md` com instruções passo a passo.
    *   **Estado:** Código completo e compilando. Próximo passo: executar SQL no Supabase e criar primeiro usuário.
*   **07/07/2026 — Sessão 2:**
    *   Sanitização do hook `useProcessos` e `App.jsx` para evitar queries de banco antes do login.
    *   Correção de compatibilidade dos scripts do `package.json` para rodarem de forma nativa no ambiente Windows com caractere especial `&` no caminho do usuário.
    *   Criação e minificação da secret `GOOGLE_CALENDAR_CREDENTIALS` a partir da chave JSON do Google Cloud.
    *   Inclusão do identificador de operador (`user?.email`) nos e-mails de protocolo, exclusão e alertas manuais/vencimento.
    *   Build de produção validado e executando com sucesso (455.76 kB).
