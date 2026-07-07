# 📋 Sistema de Controle de Alvarás Judiciais
## Arôso & Pontin Advogados Associados — São Luís/MA

---

## 🚀 Como rodar o projeto localmente

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Acesse em: **http://localhost:3000**

### 3. Gerar build para produção
```bash
npm run build
```

---

## 📁 Estrutura do projeto

```
alvaras-project/
├── src/
│   ├── App.jsx          ← Componente principal (todo o sistema)
│   ├── main.jsx         ← Ponto de entrada React
│   └── index.css        ← Estilos globais
├── public/              ← Arquivos estáticos
├── index.html           ← HTML base
├── vite.config.js       ← Configuração do Vite
├── package.json         ← Dependências do projeto
├── .env.example         ← Variáveis de ambiente (copiar para .env)
├── .gitignore           ← Arquivos ignorados pelo Git
├── GUIA-GMAIL-MCP.md   ← Guia de configuração OAuth Gmail + Claude Desktop
└── README.md            ← Este arquivo
```

---

## ⚙️ Funcionalidades do sistema

| Funcionalidade | Descrição |
|---|---|
| 📊 Painel de controle | Métricas em tempo real, alertas de urgência |
| 📋 Gestão de processos | CRUD completo com validação de campos obrigatórios |
| 💰 Controle de depósitos | Datas previstas, alertas automáticos, histórico |
| 📈 Relatórios | 6 dimensões de agrupamento com totais |
| 🤖 Análise com IA | Claude analisa cada processo e sugere providências |
| 📧 E-mail automático | Protocolo enviado a cada cadastro/alteração/exclusão |
| 📅 Google Calendar | Eventos criados automaticamente por operação |
| 🗑️ Exclusão segura | E-mail + remoção de eventos ao excluir processo |

---

## 📧 Integração com Gmail e Google Calendar

O sistema usa a **API do Claude** com servidores MCP para integração com Gmail e Google Calendar.

### Para envio direto de e-mails (sem rascunhos):
Siga o guia completo: **GUIA-GMAIL-MCP.md**

### E-mails enviados automaticamente em:
- ✅ Novo processo cadastrado → `[CADASTRADO]`
- ✅ Processo atualizado → `[ATUALIZADO]`
- ✅ Depósito confirmado → `[DEPÓSITO CONFIRMADO]`
- ✅ Nova data de depósito → `[NOVA DATA DE DEPÓSITO]`
- ✅ Contato registrado → `[CONTATO REGISTRADO]`
- ✅ Processo excluído → `[PROCESSO EXCLUÍDO]`
- ✅ Alerta de vencimento → `🚨 DEPÓSITO VENCIDO`

### Destinatários fixos:
- `felipe@arosopontinadvogados.com.br`
- `escritorio@arosopontinadvogados.com.br`

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18.x | Interface do sistema |
| Vite | 5.x | Build e servidor de desenvolvimento |
| Claude API | claude-sonnet-4-6 | IA + integrações MCP |
| Gmail MCP | googleapis.com | Envio de e-mails |
| Google Calendar MCP | googleapis.com | Criação de eventos |

---

## 🔧 Como editar no IDE

### VS Code
```bash
code .
```

### Arquivos principais para editar:
- **`src/App.jsx`** → Todo o sistema (componentes, lógica, integrações)
- **`src/index.css`** → Estilos globais adicionais
- **`.env`** → Variáveis de ambiente (crie a partir do `.env.example`)

### Seções do App.jsx:
| Linha aprox. | Seção |
|---|---|
| 1–10 | Constantes de e-mail e URLs MCP |
| 11–50 | Listas de opções (situações, status, tipos...) |
| 51–100 | Funções utilitárias (formatação, cálculos) |
| 101–160 | Funções de integração (enviarEmail, criarEvento) |
| 161–200 | Corpo dos e-mails de protocolo |
| 201–230 | Dados de demonstração |
| 231–700 | Componente principal AlvarasApp |
| 701–900 | Modal de cadastro/edição ModalProcesso |

---

## 📞 Informações do escritório

**Arôso & Pontin Advogados Associados**
Av. dos Holandeses, Nº 06, Edifício Tech Office, Salas 823 e 824
Bairro Ponta D'areia — CEP: 65077-357 — São Luís/MA
Telefones: (98) 98585-5394 | (98) 98514-8295 | (98) 98883-7000
Instagram: @arosoepontinadvogados
Site: www.arosopontinadvogados.com.br
