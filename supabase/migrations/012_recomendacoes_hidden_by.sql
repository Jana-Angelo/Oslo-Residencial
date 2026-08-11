-- =====================================================
-- MIGRATION: Ocultar indicações (IndicaApt)
-- Adiciona a coluna hidden_by para o recurso "Ocultar indicação",
-- persistindo quais moradores ocultaram cada publicação do feed.
-- Execute este SQL no Supabase SQL Editor.
-- =====================================================

ALTER TABLE recomendacoes
  ADD COLUMN IF NOT EXISTS hidden_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS author_role TEXT;
