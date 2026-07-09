# Guia: Configurar Google Calendar API com Conta de Serviço

Este guia detalha o passo a passo para conectar o sistema de alvarás do escritório **Arôso & Pontin Advogados Associados** ao Google Calendar oficial do escritório.

Atualmente, o sistema está configurado em **modo de testes (mock)** para o calendário. Siga estes passos quando desejar ativar a integração real.

---

## 📁 Passo 0: Criar um Projeto no Google Cloud Console

Se você ainda não possui um projeto criado no Google Cloud, siga estes passos para criar um do zero:

1. Acesse o **[Google Cloud Console](https://console.cloud.google.com/)** com a conta Google do escritório.
2. No menu superior esquerdo (ao lado do logo do Google Cloud), clique no menu suspenso de seleção de projetos.
3. Na janela que se abre, clique em **Novo Projeto** (New Project) no canto superior direito.
4. Defina os detalhes do projeto:
   * **Nome do projeto:** `AP-Alvaras` (ou o nome de sua preferência)
   * **Organização / Local:** Deixe o padrão do escritório.
5. Clique em **Criar** e aguarde alguns segundos até o projeto ser inicializado.
6. Certifique-se de que o novo projeto está selecionado no menu superior.

---

## 🔌 Passo 0.5: Ativar a API do Google Calendar

Com o projeto criado, precisamos habilitar o acesso dele à API de Calendário do Google:

1. No menu de busca do Cloud Console (no topo), digite `Google Calendar API` e clique na opção correspondente.
2. Na página da API, clique no botão azul **Ativar** (Enable).
3. Aguarde a ativação concluir. Agora seu projeto Google Cloud tem permissão para interagir com agendas.

---

## 🛠️ Passo 1: Criar Conta de Serviço no Google Cloud Console

As Contas de Serviço permitem que o backend (Supabase Edge Functions) se conecte de forma segura às APIs do Google em nome do escritório sem requerer interações manuais ou login recorrente na tela.

1. No painel do Google Cloud, acesse o menu lateral esquerdo e vá em **IAM e administrador** → **Contas de serviço** (ou busque por "Contas de serviço" na barra de pesquisa superior).
2. Clique em **`+ CRIAR CONTA DE SERVIÇO`** no menu superior.
3. Preencha os detalhes:
   * **Nome da conta de serviço:** `calendar-service-account`
   * **ID da conta de serviço:** (Gerado automaticamente)
   * **Descrição:** `Acesso seguro do sistema de alvarás ao calendário do escritório`
4. Clique em **Criar e continuar**.
5. Na etapa de Papel (Opcional), clique em **Continuar** e depois em **Concluído** (não é necessário conceder papéis globais no projeto).

---

## 🔑 Passo 2: Gerar a Chave de Credenciais JSON

1. Na lista de Contas de Serviço, localize a conta que acabou de criar (`calendar-service-account@...`).
2. Clique nos três pontinhos na coluna de ações e selecione **Gerenciar chaves**.
3. Clique em **Adicionar chave** → **Criar nova chave**.
4. Escolha o formato **JSON** e clique em **Criar**.
5. Um arquivo `.json` contendo a chave privada será baixado automaticamente para seu computador.
   > ⚠️ **IMPORTANTE:** Guarde este arquivo com segurança máxima. Ele contém a chave privada que dá acesso ao calendário.

---

## 📅 Passo 3: Compartilhar o Calendário do Escritório

Por padrão, a conta de serviço só tem acesso aos seus próprios calendários. Para que ela possa ler e gravar na agenda do escritório (ex: `felipe@arosopontinadvogados.com.br` ou `escritorio@...`), você deve compartilhar a agenda com ela.

1. Abra o **[Google Agenda](https://calendar.google.com/)** logado no e-mail do escritório que receberá os eventos.
2. No menu esquerdo, localize a agenda principal (abaixo de "Minhas agendas"  ).
3. Clique nos três pontinhos ao lado da agenda e selecione **Configurações e compartilhamento**.
4. Vá até a seção **Compartilhar com pessoas ou grupos específicos** e clique em **`+ Adicionar pessoas e grupos`**.
5. No campo de e-mail, cole o endereço da Conta de Serviço criado no Passo 1 (ex:`calendar-service-account@NOME-DO-PROJETO.iam.gserviceaccount.com`).
6. Na opção de Permissões, selecione obrigatoriamente **Fazer alterações e gerenciar compartilhamento** (ou no mínimo **Fazer alterações em eventos**).
7. Clique em **Enviar**.

---

## 🔐 Passo 4: Configurar as Credenciais nos Secrets do Supabase

Agora vamos salvar as credenciais de acesso no ambiente seguro do Supabase.

1. Abra o arquivo `.json` baixado no Passo 2 e copie todo o seu conteúdo.
2. Remova quebras de linha adicionais para que fique em uma única linha, se possível, ou simplesmente cole-o.
3. No terminal do seu projeto, utilize a CLI do Supabase para configurar a variável ou adicione através do Painel Web do Supabase (Configurações do Projeto → API → Secrets).
4. O nome da chave deve ser:
   ```
   GOOGLE_CALENDAR_CREDENTIALS
   ```
5. O valor deve ser o JSON completo que você copiou (contendo `"client_email"`, `"private_key"`, etc.):
   ```json
   {"type": "service_account", "project_id": "...", "private_key_id": "...", "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n", "client_email": "calendar-service-account@...", ...}
   ```

Assim que essa variável for preenchida e salva nos Secrets do Supabase, a Edge Function `calendar-event` sairá automaticamente do modo teste/mock e começará a registrar e remover os compromissos diretamente na agenda compartilhada!
