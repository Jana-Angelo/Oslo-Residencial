-- =====================================================
-- MIGRATION: Limpar todos os posts (avisos + recomendações)
-- Execute este SQL no Supabase SQL Editor antes da entrega
-- =====================================================

DELETE FROM recomendacoes;
DELETE FROM avisos;
