-- =====================================================
-- MIGRATION: Corrigir recursão infinita no RLS da tabela perfis
-- A política "Admins veem todos os perfis" usa ALL + consulta perfis dentro do RLS
-- Causa infinite recursion quando qualquer UPDATE/SELECT é feito
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Criar função SECURITY DEFINER que bypassa RLS
--    (roda com privilégios do owner, não trigga políticas recursivamente)
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

-- 2. Remover a política recursiva antiga
DROP POLICY IF EXISTS "Admins veem todos os perfis" ON perfis;

-- 3. Recriar como SELECT-only usando a função segura
CREATE POLICY "Admins veem todos os perfis" ON perfis
  FOR SELECT USING (public.is_admin_or_sindico());
