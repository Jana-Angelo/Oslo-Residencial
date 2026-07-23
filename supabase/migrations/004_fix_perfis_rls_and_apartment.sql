-- =====================================================
-- MIGRATION: Corrigir RLS da tabela perfis + coluna apartment_number
-- A tabela perfis só tinha política de SELECT.
-- INSERT, UPDATE e DELETE estavam falhando silenciosamente.
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Adicionar coluna apartment_number se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'perfis' AND column_name = 'apartment_number'
  ) THEN
    ALTER TABLE perfis ADD COLUMN apartment_number TEXT;
  END IF;
END $$;

-- 2. Políticas RLS para perfis (autenticado pode ler/escrever seu próprio perfil)

-- Permitir que o usuário autenticado leia seu próprio perfil
DROP POLICY IF EXISTS "Usuários leem próprio perfil" ON perfis;
CREATE POLICY "Usuários leem próprio perfil" ON perfis
  FOR SELECT USING (auth.uid() = id);

-- Permitir que o usuário autenticado insira seu próprio perfil
DROP POLICY IF EXISTS "Usuários inserem próprio perfil" ON perfis;
CREATE POLICY "Usuários inserem próprio perfil" ON perfis
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir que o usuário autenticado atualize seu próprio perfil
DROP POLICY IF EXISTS "Usuários atualizam próprio perfil" ON perfis;
CREATE POLICY "Usuários atualizam próprio perfil" ON perfis
  FOR UPDATE USING (auth.uid() = id);

-- Permitir que o usuário autenticado delete seu próprio perfil
DROP POLICY IF EXISTS "Usuários deletam próprio perfil" ON perfis;
CREATE POLICY "Usuários deletam próprio perfil" ON perfis
  FOR DELETE USING (auth.uid() = id);

-- 3. Políticas RLS para moradores (autenticado pode gerenciar seu próprio vínculo)
ALTER TABLE moradores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Moradores leem próprio vínculo" ON moradores;
CREATE POLICY "Moradores leem próprio vínculo" ON moradores
  FOR SELECT USING (auth.uid() = perfil_id);

DROP POLICY IF EXISTS "Moradores inserem próprio vínculo" ON moradores;
CREATE POLICY "Moradores inserem próprio vínculo" ON moradores
  FOR INSERT WITH CHECK (auth.uid() = perfil_id);

DROP POLICY IF EXISTS "Moradores atualizam próprio vínculo" ON moradores;
CREATE POLICY "Moradores atualizam próprio vínculo" ON moradores
  FOR UPDATE USING (auth.uid() = perfil_id);

-- 4. Políticas RLS para unidades (autenticado pode ler/criar unidades)
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Unidades leitura autenticado" ON unidades;
CREATE POLICY "Unidades leitura autenticado" ON unidades
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Unidades inserir autenticado" ON unidades;
CREATE POLICY "Unidades inserir autenticado" ON unidades
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
