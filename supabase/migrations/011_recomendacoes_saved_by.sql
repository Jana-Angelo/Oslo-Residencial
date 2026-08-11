-- =====================================================
-- MIGRATION: Salvar indicações (IndicaApt)
-- Adiciona a coluna saved_by para o recurso "Favoritos"
-- (salvar para consultar depois), persistindo quais
-- moradores salvaram cada indicação. Execute este SQL
-- no Supabase SQL Editor.
-- =====================================================

ALTER TABLE recomendacoes
  ADD COLUMN IF NOT EXISTS saved_by JSONB NOT NULL DEFAULT '[]'::jsonb;
