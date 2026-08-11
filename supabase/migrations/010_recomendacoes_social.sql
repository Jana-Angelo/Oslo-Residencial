-- =====================================================
-- MIGRATION: Recursos sociais do IndicaApt
-- Adiciona prova social (endossos, comentários e visualizações)
-- à tabela recomendacoes. Execute este SQL no Supabase SQL Editor.
-- =====================================================

ALTER TABLE recomendacoes
  ADD COLUMN IF NOT EXISTS likes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS liked_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS viewed_by JSONB NOT NULL DEFAULT '[]'::jsonb;
