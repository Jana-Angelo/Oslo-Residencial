-- =====================================================
-- MIGRATION: Tabelas compartilhadas do Oslo Residencial
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Tabelas de autenticação (já existentes):
-- perfis, moradores, unidades

-- =====================================================
-- AVISOS
-- =====================================================
CREATE TABLE IF NOT EXISTS avisos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  category_label TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date TEXT,
  time TEXT,
  author TEXT NOT NULL DEFAULT '',
  author_role TEXT,
  is_critical BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  details TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE avisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Avisos leitura pública" ON avisos
  FOR SELECT USING (true);

CREATE POLICY "Avisos inserir autenticado" ON avisos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Avisos atualizar autenticado" ON avisos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Avisos deletar autenticado" ON avisos
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- RECOMENDAÇÕES (IndicaApt)
-- =====================================================
CREATE TABLE IF NOT EXISTS recomendacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment TEXT NOT NULL,
  author_name TEXT,
  author_avatar TEXT,
  provider_name TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'OUTROS',
  comment TEXT NOT NULL DEFAULT '',
  rating INTEGER DEFAULT 5,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  link TEXT,
  link_text TEXT,
  phone TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recomendacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recomendações leitura pública" ON recomendacoes
  FOR SELECT USING (true);

CREATE POLICY "Recomendações inserir autenticado" ON recomendacoes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Recomendações atualizar autenticado" ON recomendacoes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Recomendações deletar autenticado" ON recomendacoes
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PAGAMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit TEXT NOT NULL,
  due_date TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Pago')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pagamentos leitura autenticado" ON pagamentos
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Pagamentos inserir autenticado" ON pagamentos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Pagamentos atualizar autenticado" ON pagamentos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Pagamentos deletar autenticado" ON pagamentos
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- RESUMO FINANCEIRO
-- =====================================================
CREATE TABLE IF NOT EXISTS resumo_financeiro (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  balance NUMERIC(12, 2) DEFAULT 0,
  pending_total NUMERIC(12, 2) DEFAULT 0,
  pending_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resumo_financeiro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resumo financeiro leitura autenticado" ON resumo_financeiro
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Resumo financeiro atualizar autenticado" ON resumo_financeiro
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Resumo financeiro inserir autenticado" ON resumo_financeiro
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- FLUXO MENSAL
-- =====================================================
CREATE TABLE IF NOT EXISTS fluxo_mensal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  income NUMERIC(12, 2) DEFAULT 0,
  expense NUMERIC(12, 2) DEFAULT 0,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fluxo_mensal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fluxo mensal leitura autenticado" ON fluxo_mensal
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Fluxo mensal inserir autenticado" ON fluxo_mensal
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Fluxo mensal atualizar autenticado" ON fluxo_mensal
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Fluxo mensal deletar autenticado" ON fluxo_mensal
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- CATEGORIAS DE DESPESA
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias_despesa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  percentage NUMERIC(5, 2) DEFAULT 0,
  amount NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categorias_despesa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias despesa leitura autenticado" ON categorias_despesa
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Categorias despesa inserir autenticado" ON categorias_despesa
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Categorias despesa atualizar autenticado" ON categorias_despesa
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Categorias despesa deletar autenticado" ON categorias_despesa
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- PERFIL DO SÍNDICO
-- =====================================================
CREATE TABLE IF NOT EXISTS perfil_sindico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  period TEXT,
  quote TEXT,
  avatar_url TEXT,
  whatsapp TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE perfil_sindico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfil síndico leitura pública" ON perfil_sindico
  FOR SELECT USING (true);

CREATE POLICY "Perfil síndico atualizar autenticado" ON perfil_sindico
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Perfil síndico inserir autenticado" ON perfil_sindico
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
