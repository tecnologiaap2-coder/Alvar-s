# Guia: Configurar Gmail MCP com OAuth no Claude Desktop
### Arôso & Pontin Advogados Associados — Envio direto de e-mails pelo sistema de alvarás

---

## O que esse guia resolve

O MCP do Gmail conectado ao Claude.ai **só cria rascunhos** — não envia e-mails. Para que o sistema de alvarás envie os protocolos diretamente para `felipe@arosopontinadvogados.com.br` e `escritorio@arosopontinadvogados.com.br` sem intervenção manual, é preciso configurar o **Claude Desktop** com um servidor MCP local do Gmail, autenticado via OAuth 2.0. Com isso, o Claude passa a ter permissão total para **enviar e-mails** pela sua conta do Google.

**Tempo estimado:** 20 a 30 minutos na primeira vez.

---

## Pré-requisitos

Antes de começar, verifique se você tem:

- [ ] **Claude Desktop** instalado no Windows ou Mac → [baixar em claude.ai/download](https://claude.ai/download)
- [ ] **Node.js 18 ou superior** instalado → [baixar em nodejs.org](https://nodejs.org)
- [ ] Conta Google do escritório com acesso ao **Google Cloud Console**
- [ ] Navegador aberto e logado na conta `felipe@arosopontinadvogados.com.br`

Para verificar se o Node.js está instalado, abra o terminal (Prompt de Comando ou PowerShell no Windows) e digite:
```
node --version
```
Se aparecer um número como `v20.x.x`, está ok. Se não aparecer, instale o Node.js antes de continuar.

---

## PARTE 1 — Criar credenciais OAuth no Google Cloud Console

Essa parte é feita uma única vez. Você vai criar as credenciais que autorizam o Claude Desktop a acessar o Gmail.

### Passo 1 — Acessar o Google Cloud Console

1. Acesse: [console.cloud.google.com](https://console.cloud.google.com)
2. Faça login com a conta Google do escritório
3. No topo da página, clique em **"Selecionar projeto"** → **"Novo projeto"**
4. Nome do projeto: `gmail-mcp-alvaras`
5. Clique em **Criar**

---

### Passo 2 — Ativar a API do Gmail

1. No menu lateral, clique em **"APIs e serviços"** → **"Biblioteca"**
2. Na barra de busca, digite: `Gmail API`
3. Clique no resultado **"Gmail API"**
4. Clique em **"Ativar"**
5. Aguarde a ativação (leva alguns segundos)

---

### Passo 3 — Configurar a tela de consentimento OAuth

1. No menu lateral, clique em **"APIs e serviços"** → **"Tela de consentimento OAuth"**
2. Selecione o tipo de usuário: **"Externo"** → clique em **Criar**
3. Preencha os campos obrigatórios:
   - **Nome do aplicativo:** `Gmail MCP Alvarás`
   - **E-mail de suporte ao usuário:** `felipe@arosopontinadvogados.com.br`
   - **E-mail de contato do desenvolvedor:** `felipe@arosopontinadvogados.com.br`
4. Clique em **"Salvar e continuar"** (nas próximas telas, clique em continuar sem preencher nada até chegar em "Resumo")
5. Clique em **"Voltar ao painel"**

> ⚠️ Se o app ficar em modo de teste, você precisará adicionar seu e-mail como usuário de teste. Veja o Passo 4a abaixo.

---

### Passo 3a — Adicionar usuário de teste (se necessário)

1. Ainda na tela de consentimento OAuth, clique na aba **"Usuários de teste"**
2. Clique em **"+ Adicionar usuários"**
3. Adicione: `felipe@arosopontinadvogados.com.br`
4. Adicione também: `escritorio@arosopontinadvogados.com.br`
5. Clique em **Salvar**

---

### Passo 4 — Criar as credenciais OAuth 2.0

1. No menu lateral, clique em **"APIs e serviços"** → **"Credenciais"**
2. Clique em **"+ Criar credenciais"** → **"ID do cliente OAuth"**
3. Em **"Tipo de aplicativo"**, selecione: **"Aplicativo para computador"** (Desktop app)
4. Em **"Nome"**, digite: `Claude Desktop Gmail MCP`
5. Clique em **"Criar"**
6. Uma janela vai aparecer com o **Client ID** e o **Client Secret**
7. Clique em **"Baixar JSON"** — salve o arquivo com o nome `gcp-oauth.keys.json`

> 🔐 Guarde esse arquivo em local seguro. Ele é como uma senha de acesso ao Gmail.

---

## PARTE 2 — Instalar o servidor MCP do Gmail

### Passo 5 — Instalar o pacote npm

Abra o terminal (Prompt de Comando ou PowerShell) e execute:

```bash
npm install -g @gongrzhe/server-gmail-autoauth-mcp
```

Aguarde a instalação terminar. Se aparecer algum aviso em amarelo, pode ignorar — são avisos normais, não erros.

---

### Passo 6 — Configurar o arquivo de credenciais

No terminal, execute os comandos abaixo **um por vez**:

**No Windows (PowerShell):**
```powershell
mkdir -Force "$env:USERPROFILE\.gmail-mcp"
copy "C:\caminho\para\gcp-oauth.keys.json" "$env:USERPROFILE\.gmail-mcp\gcp-oauth.keys.json"
```

**No Mac ou Linux:**
```bash
mkdir -p ~/.gmail-mcp
cp /caminho/para/gcp-oauth.keys.json ~/.gmail-mcp/gcp-oauth.keys.json
```

> ⚠️ Substitua `/caminho/para/` pelo local real onde você salvou o arquivo `gcp-oauth.keys.json`.
> Por exemplo, se salvou na pasta Downloads: `C:\Users\Felipe\Downloads\gcp-oauth.keys.json`

---

### Passo 7 — Autenticar com o Google

Execute no terminal:

```bash
npx @gongrzhe/server-gmail-autoauth-mcp auth
```

O que vai acontecer:
1. Um link vai aparecer no terminal
2. Seu navegador vai abrir automaticamente (ou copie e cole o link)
3. Faça login com a conta `felipe@arosopontinadvogados.com.br`
4. Clique em **"Avançado"** → **"Acessar gmail-mcp-alvaras (não seguro)"** (é seguro — seu app ainda está em modo de teste)
5. Clique em **"Permitir"** para todas as permissões solicitadas
6. O terminal vai mostrar: `Authentication successful!`

> ✅ Após essa etapa, o token é salvo em `~/.gmail-mcp/` e se renova automaticamente. Você não precisa fazer isso de novo.

---

## PARTE 3 — Configurar o Claude Desktop

### Passo 8 — Abrir o arquivo de configuração do Claude Desktop

Localize o arquivo `claude_desktop_config.json` no seu computador:

| Sistema | Caminho |
|---|---|
| **Windows** | `C:\Users\SeuUsuario\AppData\Roaming\Claude\claude_desktop_config.json` |
| **Mac** | `~/Library/Application Support/Claude/claude_desktop_config.json` |

**Como abrir no Windows:**
1. Pressione `Win + R`
2. Digite: `%APPDATA%\Claude\`
3. Pressione Enter
4. Abra o arquivo `claude_desktop_config.json` com o Bloco de Notas ou VS Code

**Como abrir no Mac:**
1. Abra o Finder
2. Pressione `Cmd + Shift + G`
3. Cole: `~/Library/Application Support/Claude/`
4. Abra o arquivo `claude_desktop_config.json`

---

### Passo 9 — Adicionar o servidor MCP ao arquivo de configuração

Substitua o conteúdo do arquivo por este (ou adicione dentro de `mcpServers` se já houver outros):

```json
{
  "mcpServers": {
    "gmail": {
      "command": "npx",
      "args": [
        "@gongrzhe/server-gmail-autoauth-mcp"
      ]
    }
  }
}
```

> Se o arquivo já tiver outros servidores MCP configurados, adicione apenas o bloco `"gmail": { ... }` dentro de `"mcpServers": { }`, separado por vírgula dos outros.

Salve o arquivo.

---

### Passo 10 — Reiniciar o Claude Desktop

1. Feche completamente o Claude Desktop (não apenas minimize — feche pela bandeja do sistema ou pelo menu)
2. Abra o Claude Desktop novamente
3. Aguarde alguns segundos para o servidor MCP inicializar

**Como verificar se funcionou:**

No Claude Desktop, inicie uma nova conversa e diga:
```
Teste o servidor MCP do Gmail. Você consegue listar os rascunhos da minha caixa?
```

Se o Claude listar rascunhos ou confirmar acesso ao Gmail, a configuração está correta.

---

## PARTE 4 — Verificar as permissões de envio

### Passo 11 — Confirmar que o escopo de envio está ativo

O servidor MCP instalado inclui o escopo `gmail.send` por padrão, que permite envio direto. Para confirmar, envie um e-mail de teste pelo Claude Desktop:

No Claude Desktop, diga:
```
Envie um e-mail de teste para felipe@arosopontinadvogados.com.br com assunto "Teste MCP Gmail" 
e corpo "Configuração do Gmail MCP funcionando corretamente."
```

Se o e-mail chegar na sua caixa de entrada (não nos rascunhos), a configuração está completa e o sistema de alvarás passará a enviar os protocolos diretamente.

---

## PARTE 5 — Configurar para duas contas (opcional)

Se quiser que os e-mails sejam enviados **da conta do escritório** e não apenas para ela, configure uma segunda instância:

```json
{
  "mcpServers": {
    "gmail-felipe": {
      "command": "npx",
      "args": ["@gongrzhe/server-gmail-autoauth-mcp"],
      "env": {
        "GMAIL_MCP_CONFIG_DIR": "C:\\Users\\SeuUsuario\\.gmail-mcp-felipe"
      }
    },
    "gmail-escritorio": {
      "command": "npx",
      "args": ["@gongrzhe/server-gmail-autoauth-mcp"],
      "env": {
        "GMAIL_MCP_CONFIG_DIR": "C:\\Users\\SeuUsuario\\.gmail-mcp-escritorio"
      }
    }
  }
}
```

Depois autentique cada conta separadamente:
```bash
# Conta Felipe
GMAIL_MCP_CONFIG_DIR=~/.gmail-mcp-felipe npx @gongrzhe/server-gmail-autoauth-mcp auth

# Conta Escritório
GMAIL_MCP_CONFIG_DIR=~/.gmail-mcp-escritorio npx @gongrzhe/server-gmail-autoauth-mcp auth
```

---

## Solução de problemas comuns

### "Access blocked" ao fazer login no Google
**Causa:** O app está em modo de teste e seu e-mail não foi adicionado como usuário de teste.
**Solução:** Volte ao Google Cloud Console → Tela de consentimento OAuth → Usuários de teste → adicione seu e-mail.

---

### O Claude não reconhece o servidor MCP
**Causa:** O arquivo `claude_desktop_config.json` tem erro de sintaxe (vírgula faltando, chave não fechada).
**Solução:** Cole o JSON em [jsonlint.com](https://jsonlint.com) para verificar erros, corrija e salve novamente. Reinicie o Claude Desktop.

---

### "npx: command not found"
**Causa:** O Node.js não está instalado ou não está no PATH.
**Solução:** Instale o Node.js em [nodejs.org](https://nodejs.org), reinicie o terminal e tente novamente.

---

### O e-mail vai para rascunhos em vez de ser enviado
**Causa:** O servidor MCP em uso é o remoto do Google (gmailmcp.googleapis.com) que só tem `create_draft`.
**Solução:** Confirme que o Claude Desktop está usando o servidor local (`@gongrzhe/server-gmail-autoauth-mcp`) e não o remoto. Verifique o `claude_desktop_config.json`.

---

### Token expirado após alguns dias
**Causa:** Normal — o OAuth token de acesso expira, mas o refresh token renova automaticamente.
**Solução:** Se a renovação automática falhar, execute novamente: `npx @gongrzhe/server-gmail-autoauth-mcp auth`

---

## Resumo do que foi configurado

Após seguir esse guia, o Claude Desktop terá:

| Capacidade | Status |
|---|---|
| Ler e-mails e rascunhos | ✅ Ativo |
| Criar rascunhos | ✅ Ativo |
| **Enviar e-mails diretamente** | ✅ **Ativo** |
| Buscar e-mails | ✅ Ativo |
| Gerenciar labels | ✅ Ativo |

O sistema de controle de alvarás passará a enviar protocolos diretamente para:
- `felipe@arosopontinadvogados.com.br`
- `escritorio@arosopontinadvogados.com.br`

em todo cadastro, atualização, exclusão, confirmação de depósito e registro de contato.

---

*Guia gerado para Arôso & Pontin Advogados Associados — São Luís/MA*
*Em caso de dúvidas, abra o Claude Desktop e descreva o erro exato que está aparecendo.*
