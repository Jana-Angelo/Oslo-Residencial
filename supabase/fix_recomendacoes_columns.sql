-- =====================================================
-- FIX: Todas as colunas faltantes em recomendacoes
-- Migrations 010, 011 e 012 nunca foram executadas
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Migracao 010: Prova social
ALTER TABLE recomendacoes
  ADD COLUMN IF NOT EXISTS likes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS liked_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS viewed_by JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Migracao 011: Favoritos
ALTER TABLE recomendacoes
  ADD COLUMN IF NOT EXISTS saved_by JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Migracao 012: Ocultar + author_role
ALTER TABLE recomendacoes
  ADD COLUMN IF NOT EXISTS hidden_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS author_role TEXT;
