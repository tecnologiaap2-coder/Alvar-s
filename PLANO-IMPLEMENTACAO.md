# 📋 Plano de Implementação — Sistema de Alvarás Judiciais
## De protótipo para aplicação de produção com Supabase + Vercel

**Escritório**: Arôso & Pontin Advogados Associados — São Luís/MA  
**Data**: 06/07/2026  
**Versão**: 2.0 (atualizada com decisões do cliente)

---

## 📸 Estado Atual do Projeto

### O que temos hoje

O projeto é um **protótipo funcional gerado por IA (Claude)** em uma única conversa. Funciona localmente com `npm run dev` e tem visual funcional, mas **não é adequado para uso em produção**.

### Arquitetura atual

```
alvaras-project/
├── src/
│   ├── App.jsx          ← ⚠️ MONOLITO: 984 linhas, TUDO aqui
│   ├── main.jsx         ← Ponto de entrada React
│   └── index.css        ← 11 linhas de CSS básico
├── index.html
├── vite.config.js
├── package.json         ← React 18 + Vite 5
├── .env.example
└── README.md
```

### Problemas Críticos Identificados

| # | Problema | Gravidade | Impacto |
|---|---|---|---|
| 1 | **Dados em `sessionStorage`** | 🔴 Crítico | Todos os dados se perdem ao fechar o navegador |
| 2 | **API key Anthropic exposta no frontend** | 🔴 Crítico | Qualquer um pode copiar sua chave da API — risco financeiro e de segurança |
| 3 | **Sem autenticação** | 🔴 Crítico | Qualquer pessoa com a URL acessa todos os processos |
| 4 | **Arquivo monolítico de 984 linhas** | 🟡 Alto | Impossível manter, debugar ou adicionar funcionalidades |
| 5 | **Inline styles em todo o código** | 🟡 Alto | Design inconsistente, impossível criar dark mode ou temas |
| 6 | **Sem responsividade real** | 🟡 Alto | Layout quebra em celular/tablet |
| 7 | **Emails via MCP do Claude no frontend** | 🟡 Alto | Provavelmente não funciona — a API MCP não é acessível diretamente do browser |
| 8 | **Dados demo misturados com código** | 🟢 Médio | 3 processos fictícios hardcoded no código |
| 9 | **Sem validação no backend** | 🟢 Médio | Todas as validações estão no frontend, podem ser burladas |
| 10 | **Sem histórico de auditoria real** | 🟢 Médio | Histórico existe apenas na sessão |

### O que funciona bem e será preservado

- ✅ Lógica de negócio (cálculo de prioridade, status, métricas)
- ✅ Fluxo de CRUD de processos
- ✅ Sistema de depósitos com renovação e confirmação
- ✅ Relatórios com 6 dimensões de agrupamento
- ✅ Listas de opções (situações, status, tipos, etc.)
- ✅ Fluxo de notificações e protocolos

---

## ✅ Decisões Tomadas

| Questão | Decisão |
|---|---|
| **Autenticação** | Supabase Auth com email/senha |
| **Email** | Gmail API via Supabase Edge Function com conta específica do escritório |
| **Google Calendar** | ✅ Manter integração via Edge Function |
| **Análise com IA (Claude)** | ❌ Desativada por enquanto (botão ficará inativo/oculto) |
| **Multiusuário** | Não — apenas escritório Arôso & Pontin |
| **Framework** | Manter Vite + React (SPA) — sem migrar para Next.js |
| **Deploy** | Vercel (frontend) + Supabase (backend) |

---

## 📧 Sobre o Envio de Emails (Gmail)

### Como vai funcionar

Para enviar emails de uma conta Gmail específica do escritório, a abordagem mais simples e confiável é usar **SMTP do Gmail com Senha de App**.

> **Sim, é necessário criar uma Senha de App na conta Google que enviará os emails.**

### Passo a passo para configurar:

1. Acesse a conta Gmail que enviará os emails (ex.: `escritorio@arosopontinadvogados.com.br`)
2. Vá em **Conta Google → Segurança**
3. Ative a **Verificação em 2 etapas** (obrigatório)
4. Depois de ativar, vá em **Senhas de app** (`myaccount.google.com/apppasswords`)
5. Crie uma senha para "Outro" → nomeie como "Sistema Alvarás"
6. Copie a senha gerada (16 caracteres) — ela será usada como variável de ambiente no Supabase

> ⚠️ **Se a conta é Google Workspace (domínio próprio)**: o administrador pode precisar habilitar "Acesso a apps menos seguros" ou Senhas de App nas configurações do Admin Console.

### Onde a senha ficará armazenada

A senha **NÃO** ficará no código. Será uma variável de ambiente segura no Supabase:

```
GMAIL_USER=escritorio@arosopontinadvogados.com.br
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

---

## 🏗️ Arquitetura da Solução

### Visão geral

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                 │
│                                                     │
│   React + Vite SPA                                  │
│   ├── Login (Supabase Auth)                         │
│   ├── Painel de Controle                            │
│   ├── Gestão de Processos                           │
│   ├── Controle de Depósitos                         │
│   └── Relatórios                                    │
│                                                     │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────┐
│                   SUPABASE (Backend)                 │
│                                                     │
│   ┌──────────────┐  ┌───────────────────────┐       │
│   │  Auth         │  │  PostgreSQL            │       │
│   │  email/senha  │  │  ├── processos         │       │
│   └──────────────┘  │  ├── historico_contatos │       │
│                      │  └── historico_renov.   │       │
│   ┌──────────────┐  └───────────────────────┘       │
│   │ Edge Functions│                                  │
│   │ ├── send-email│  ┌───────────────────────┐       │
│   │ └── calendar  │  │  Row Level Security    │       │
│   └──────────────┘  │  (proteção por usuário) │       │
│                      └───────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

### Estrutura de arquivos final

```
alvaras-project/
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.jsx                          ← Ponto de entrada
│   ├── App.jsx                           ← Router + Auth guard
│   ├── index.css                         ← Design system completo
│   │
│   ├── lib/
│   │   ├── supabase.js                   ← Cliente Supabase
│   │   └── constants.js                  ← Enums e listas de opções
│   │
│   ├── hooks/
│   │   ├── useAuth.js                    ← Login/logout/sessão
│   │   ├── useProcessos.js              ← CRUD processos + realtime
│   │   └── useToast.js                   ← Notificações toast
│   │
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx               ← Barra superior
│   │   │   ├── Navbar.jsx               ← Navegação por abas
│   │   │   └── Toast.jsx                ← Componente de notificação
│   │   │
│   │   ├── Auth/
│   │   │   └── LoginPage.jsx            ← Tela de login
│   │   │
│   │   ├── Painel/
│   │   │   ├── PainelPage.jsx           ← Dashboard com métricas
│   │   │   ├── MetricCard.jsx           ← Card individual de métrica
│   │   │   └── UrgentList.jsx           ← Lista de ações urgentes
│   │   │
│   │   ├── Processos/
│   │   │   ├── ProcessosPage.jsx        ← Lista + detalhe
│   │   │   ├── ProcessoCard.jsx         ← Card na listagem
│   │   │   ├── ProcessoDetalhe.jsx      ← Painel lateral de detalhe
│   │   │   ├── ModalProcesso.jsx        ← Formulário de cadastro/edição
│   │   │   └── ModalHistorico.jsx       ← Registrar contato
│   │   │
│   │   ├── Depositos/
│   │   │   ├── DepositosPage.jsx        ← Controle de depósitos
│   │   │   ├── DepositoCard.jsx         ← Card de depósito
│   │   │   └── ModalRenovacao.jsx       ← Nova data de depósito
│   │   │
│   │   ├── Relatorios/
│   │   │   └── RelatoriosPage.jsx       ← Relatórios por dimensão
│   │   │
│   │   └── shared/
│   │       ├── Badge.jsx                ← Badge de status reutilizável
│   │       ├── Modal.jsx                ← Wrapper de modal genérico
│   │       ├── ConfirmDialog.jsx        ← Diálogo de confirmação
│   │       ├── LoadingSpinner.jsx       ← Indicador de carregamento
│   │       └── EmptyState.jsx           ← Estado vazio
│   │
│   └── utils/
│       ├── formatters.js                ← formatBRL, fmtData, agora
│       ├── calculations.js              ← calcPrioridade, corStatus, badgeStatus
│       └── email.js                     ← Funções que chamam Edge Functions
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql       ← Schema do banco
│   └── functions/
│       ├── send-email/
│       │   └── index.ts                 ← Envio via Gmail SMTP
│       └── calendar-event/
│           └── index.ts                 ← Criar/remover eventos Calendar
│
├── index.html
├── vite.config.js
├── vercel.json                          ← Configuração de deploy
├── package.json
├── .env.example                         ← Template de variáveis
├── .gitignore
├── README.md
└── PLANO-IMPLEMENTACAO.md               ← Este arquivo
```

---

## 🗄️ Schema do Banco de Dados (Supabase PostgreSQL)

### Tabela `processos`

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | ✅ (auto) | Chave primária |
| `numero` | TEXT | ✅ | Número CNJ (único) |
| `cliente` | TEXT | ✅ | Nome do cliente |
| `parte_contraria` | TEXT | | Parte contrária |
| `tipo_parte_contraria` | TEXT | | Tipo (INSS, Município, etc.) |
| `comarca` | TEXT | ✅ | Comarca |
| `vara` | TEXT | ✅ | Vara / Secretaria |
| `sistema` | TEXT | | PJe, e-SAJ, etc. |
| `link_processo` | TEXT | | URL do processo |
| `tipo_credito` | TEXT | ✅ | Tipo do crédito |
| `valor_previsto` | NUMERIC | ✅ | Valor previsto (R$) |
| `valor_recebido` | NUMERIC | | Valor já recebido |
| `situacao_alvara` | TEXT | ✅ | Situação atual |
| `ultima_movimentacao` | TEXT | | Descrição da última movimentação |
| `data_ultima_movimentacao` | DATE | ✅ | Data da última movimentação |
| `proxima_providencia` | TEXT | ✅ | Próxima ação necessária |
| `data_nova_analise` | DATE | ✅ | Data para nova análise |
| `responsavel` | TEXT | ✅ | Quem está cuidando |
| `prioridade` | TEXT | | Alta, Média, Baixa |
| `observacoes` | TEXT | | Texto livre |
| `link_drive` | TEXT | | URL da pasta no Drive |
| `documentos_pendentes` | TEXT | | Documentos faltantes |
| `data_ultimo_contato` | DATE | | Último contato com secretaria |
| `meio_contato` | TEXT | | Balcão Virtual, Telefone, etc. |
| `resultado_contato` | TEXT | | O que foi dito |
| `proxima_acao` | TEXT | | Próxima ação pós-contato |
| `status_final` | TEXT | | Pendente, Pago, Arquivado, etc. |
| `data_prevista_deposito` | DATE | | Quando deve cair o depósito |
| `deposito_confirmado` | BOOLEAN | | Se já foi confirmado |
| `alerta_deposito_enviado` | BOOLEAN | | Se já alertou |
| `data_deposito_anterior` | DATE | | Data anterior (se renovada) |
| `criado_em` | TIMESTAMPTZ | ✅ (auto) | Data de criação |
| `atualizado_em` | TIMESTAMPTZ | ✅ (auto) | Última atualização |
| `user_id` | UUID | ✅ (auto) | Quem criou (FK auth.users) |

### Tabela `historico_contatos`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária |
| `processo_id` | UUID | FK → processos (CASCADE) |
| `data` | DATE | Data do contato |
| `responsavel` | TEXT | Quem fez o contato |
| `meio` | TEXT | Meio utilizado |
| `setor` | TEXT | Setor/servidor contatado |
| `resposta` | TEXT | Resposta recebida |
| `proxima_providencia` | TEXT | Próxima ação |
| `nova_data` | DATE | Nova data de análise |
| `criado_em` | TIMESTAMPTZ | Quando foi registrado |

### Tabela `historico_renovacoes`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária |
| `processo_id` | UUID | FK → processos (CASCADE) |
| `data_anterior` | DATE | Data anterior do depósito |
| `nova_data` | DATE | Nova data definida |
| `motivo` | TEXT | Motivo da renovação |
| `responsavel` | TEXT | Quem registrou |
| `registrado_em` | TIMESTAMPTZ | Quando foi registrado |

---

## 🎨 Design — De Básico para Premium

### Antes (estado atual)
- Inline styles espalhados por 984 linhas
- Emojis como ícones
- Sem dark mode
- Fonte padrão do sistema
- Sem animações

### Depois (meta)
- **CSS Variables** para tema completo (light/dark)
- **Ícones Lucide** (SVG profissional)
- **Tipografia Inter** (Google Fonts)
- **Micro-animações** (hover, transições, loading)
- **Glassmorphism** nos cards de métricas
- **Mobile-first** responsivo
- **Toast notifications** elegantes
- **Loading states** para todas as operações assíncronas

---

## 📦 Dependências Necessárias

### Novas dependências (a instalar)

| Pacote | Versão | Uso |
|---|---|---|
| `@supabase/supabase-js` | ^2.x | Cliente do banco de dados |
| `react-router-dom` | ^6.x | Navegação SPA (login ↔ app) |
| `react-hot-toast` | ^2.x | Notificações toast elegantes |
| `lucide-react` | ^0.x | Ícones SVG modernos |

### Dependências atuais (mantidas)
| Pacote | Uso |
|---|---|
| `react` ^18 | Interface |
| `react-dom` ^18 | Renderização |
| `vite` ^5 | Build tool |
| `@vitejs/plugin-react` | Plugin React para Vite |

---

## 🔐 Variáveis de Ambiente

### `.env` local (desenvolvimento)

```env
# Supabase
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Emails do escritório (usados no frontend para exibição)
VITE_EMAIL_FELIPE=felipe@arosopontinadvogados.com.br
VITE_EMAIL_ESCRITORIO=escritorio@arosopontinadvogados.com.br
```

### Supabase Edge Function Secrets (configuradas no painel Supabase)

```env
GMAIL_USER=escritorio@arosopontinadvogados.com.br
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GOOGLE_CALENDAR_CREDENTIALS={"client_email":"...","private_key":"..."}
```

### Vercel Environment Variables

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_EMAIL_FELIPE=felipe@arosopontinadvogados.com.br
VITE_EMAIL_ESCRITORIO=escritorio@arosopontinadvogados.com.br
```

> ⚠️ **Importante**: A API key da Anthropic **NÃO** será mais usada. A funcionalidade de IA está desativada por enquanto.

---

## 📌 Checklist de Execução

### Pré-requisitos (ação do cliente)

- [ ] Criar projeto no Supabase em [supabase.com](https://supabase.com)
- [ ] Fornecer **URL** e **anon key** do projeto Supabase
- [ ] Criar **Senha de App** na conta Gmail do escritório (ver instruções acima)
- [ ] Configurar projeto Google Cloud para Google Calendar API (se mantiver Calendar)

### Fase 1 — Infraestrutura (Supabase)
- [ ] Executar migration SQL para criar tabelas
- [ ] Configurar Row Level Security (RLS)
- [ ] Criar primeiro usuário via Supabase Auth
- [ ] Configurar variáveis de ambiente (secrets)

### Fase 2 — Reestruturação do Código
- [ ] Instalar novas dependências (`@supabase/supabase-js`, `react-router-dom`, `react-hot-toast`, `lucide-react`)
- [ ] Criar `lib/supabase.js` — cliente Supabase
- [ ] Criar `lib/constants.js` — extrair enums do App.jsx
- [ ] Criar `utils/formatters.js` — extrair funções de formatação
- [ ] Criar `utils/calculations.js` — extrair funções de cálculo
- [ ] Criar `hooks/useAuth.js` — hook de autenticação
- [ ] Criar `hooks/useProcessos.js` — CRUD com Supabase + realtime
- [ ] Criar `hooks/useToast.js` — sistema de notificações

### Fase 3 — Design System
- [ ] Reescrever `index.css` com CSS Variables e design system completo
- [ ] Implementar tema light/dark
- [ ] Adicionar tipografia Inter
- [ ] Criar animações e transições

### Fase 4 — Componentes
- [ ] `LoginPage.jsx` — tela de login
- [ ] `Header.jsx` + `Navbar.jsx` — layout
- [ ] `Toast.jsx` — notificações
- [ ] `Badge.jsx`, `Modal.jsx`, `ConfirmDialog.jsx` — compartilhados
- [ ] `PainelPage.jsx` + `MetricCard.jsx` + `UrgentList.jsx`
- [ ] `ProcessosPage.jsx` + `ProcessoCard.jsx` + `ProcessoDetalhe.jsx`
- [ ] `ModalProcesso.jsx` + `ModalHistorico.jsx`
- [ ] `DepositosPage.jsx` + `DepositoCard.jsx` + `ModalRenovacao.jsx`
- [ ] `RelatoriosPage.jsx`
- [ ] `App.jsx` — montar com Router e Auth guard

### Fase 5 — Edge Functions
- [ ] `send-email/index.ts` — envio via Gmail SMTP
- [ ] `calendar-event/index.ts` — criar/remover eventos no Calendar
- [ ] `utils/email.js` — funções frontend que chamam as Edge Functions

### Fase 6 — Deploy
- [ ] Criar `vercel.json`
- [ ] Conectar repositório Git à Vercel
- [ ] Configurar variáveis de ambiente na Vercel
- [ ] Testar deploy em produção
- [ ] Verificar que nenhuma chave de API está exposta no frontend

### Verificação Final
- [ ] Login com email/senha funciona
- [ ] CRUD de processos persiste no banco
- [ ] Confirmar depósito atualiza corretamente
- [ ] Relatórios geram dados do banco
- [ ] Emails são enviados ao cadastrar/atualizar/excluir
- [ ] Layout responsivo funciona em mobile
- [ ] Build sem erros (`npm run build`)

---

## 🔄 O que muda para o usuário final

| Funcionalidade | Antes | Depois |
|---|---|---|
| **Acesso** | URL direta, sem login | Login com email/senha |
| **Dados** | Perdidos ao fechar aba | Persistidos no banco para sempre |
| **Email** | Tentativa via MCP (provavelmente falha) | Gmail SMTP confiável via backend |
| **Calendar** | Via MCP no frontend | Via Edge Function segura |
| **IA** | Chave exposta no frontend | Desativada (segura quando reativada) |
| **Visual** | Funcional mas básico | Premium com dark mode e animações |
| **Mobile** | Quebrado | Responsivo completo |
| **Segurança** | Nenhuma | Auth + RLS + backend seguro |

---

*Documento gerado em 06/07/2026. Atualizar conforme decisões evoluam.*
