-- =====================================================
-- MIGRATION: Corrigir recursão infinita no RLS da tabela moradores
-- A tabela moradores tinha políticas antigas (criadas antes da 004)
-- que não foram removidas e causam infinite recursion.
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Garantir que RLS está habilitado
ALTER TABLE moradores ENABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes na tabela moradores
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'moradores'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s" ON moradores', pol.policyname);
  END LOOP;
END $$;

-- 3. Garantir que a função SECURITY DEFINER existe (necessária para admin policies)
CREATE OR REPLACE FUNCTION public.is_admin_or_sindico()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM perfis
    WHERE id = auth.uid()
    AND tipo_perfil IN ('admin', 'sindico')
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. Recriar políticas limpas (apenas acesso ao próprio registro)
CREATE POLICY "Moradores leem próprio vínculo" ON moradores
  FOR SELECT USING (auth.uid() = perfil_id);

CREATE POLICY "Moradores inserem próprio vínculo" ON moradores
  FOR INSERT WITH CHECK (auth.uid() = perfil_id);

CREATE POLICY "Moradores atualizam próprio vínculo" ON moradores
  FOR UPDATE USING (auth.uid() = perfil_id);

CREATE POLICY "Moradores deletam próprio vínculo" ON moradores
  FOR DELETE USING (auth.uid() = perfil_id);
