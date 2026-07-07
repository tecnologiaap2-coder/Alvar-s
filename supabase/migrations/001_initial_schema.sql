-- Migração inicial para o Sistema de Controle de Alvarás Judiciais
-- Criação das tabelas: processos, historico_contatos, historico_renovacoes

-- 1. Habilitar extensão pgcrypto para UUID se necessário
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de processos
CREATE TABLE IF NOT EXISTS public.processos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero TEXT NOT NULL UNIQUE,
    cliente TEXT NOT NULL,
    parte_contraria TEXT,
    tipo_parte_contraria TEXT,
    comarca TEXT NOT NULL,
    vara TEXT NOT NULL,
    sistema TEXT,
    link_processo TEXT,
    tipo_credito TEXT NOT NULL,
    valor_previsto NUMERIC NOT NULL,
    valor_recebido NUMERIC DEFAULT 0,
    situacao_alvara TEXT NOT NULL,
    ultima_movimentacao TEXT,
    data_ultima_movimentacao DATE NOT NULL,
    proxima_providencia TEXT NOT NULL,
    data_nova_analise DATE NOT NULL,
    responsavel TEXT NOT NULL,
    prioridade TEXT,
    observacoes TEXT,
    link_drive TEXT,
    documentos_pendentes TEXT,
    data_ultimo_contato DATE,
    meio_contato TEXT,
    resultado_contato TEXT,
    proxima_acao TEXT,
    status_final TEXT DEFAULT 'Pendente',
    data_prevista_deposito DATE,
    deposito_confirmado BOOLEAN DEFAULT false,
    alerta_deposito_enviado BOOLEAN DEFAULT false,
    data_deposito_anterior DATE,
    criado_em TIMESTAMPTZ DEFAULT now() NOT NULL,
    atualizado_em TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID DEFAULT auth.uid() NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Tabela de histórico de contatos
CREATE TABLE IF NOT EXISTS public.historico_contatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    responsavel TEXT NOT NULL,
    meio TEXT NOT NULL,
    setor TEXT,
    resposta TEXT,
    proxima_providencia TEXT,
    nova_data DATE,
    criado_em TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Tabela de histórico de renovações de depósitos
CREATE TABLE IF NOT EXISTS public.historico_renovacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID NOT NULL REFERENCES public.processos(id) ON DELETE CASCADE,
    data_anterior DATE NOT NULL,
    nova_data DATE NOT NULL,
    motivo TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    registrado_em TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Trigger para atualizar o campo atualizado_em da tabela processos
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_processos_updated_at
    BEFORE UPDATE ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Configuração de Row Level Security (RLS)
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_renovacoes ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de acesso (qualquer usuário autenticado do escritório pode ler/escrever todos os dados)
CREATE POLICY "Permitir leitura para usuários autenticados"
    ON public.processos FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
    ON public.processos FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
    ON public.processos FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir deleção para usuários autenticados"
    ON public.processos FOR DELETE
    TO authenticated
    USING (true);

-- Políticas para historico_contatos
CREATE POLICY "Permitir leitura de contatos para usuários autenticados"
    ON public.historico_contatos FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserção de contatos para usuários autenticados"
    ON public.historico_contatos FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de contatos para usuários autenticados"
    ON public.historico_contatos FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir deleção de contatos para usuários autenticados"
    ON public.historico_contatos FOR DELETE
    TO authenticated
    USING (true);

-- Políticas para historico_renovacoes
CREATE POLICY "Permitir leitura de renovações para usuários autenticados"
    ON public.historico_renovacoes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserção de renovações para usuários autenticados"
    ON public.historico_renovacoes FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir atualização de renovações para usuários autenticados"
    ON public.historico_renovacoes FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir deleção de renovações para usuários autenticados"
    ON public.historico_renovacoes FOR DELETE
    TO authenticated
    USING (true);
