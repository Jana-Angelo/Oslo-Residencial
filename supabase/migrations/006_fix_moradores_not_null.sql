-- =====================================================
-- MIGRATION: Tornar colunas opcionais na tabela moradores
-- nome_completo e tipo são dados do perfil, não do morador
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

ALTER TABLE moradores ALTER COLUMN nome_completo DROP NOT NULL;
