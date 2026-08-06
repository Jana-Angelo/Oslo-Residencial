-- =====================================================
-- MIGRATION: Ocorrências do condomínio
-- Tabela + políticas RLS + bucket de storage
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- TABELA: ocorrencias
-- =====================================================
CREATE TABLE IF NOT EXISTS ocorrencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Outros',
  status TEXT NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Em análise', 'Resolvida')),
  author_name TEXT NOT NULL DEFAULT '',
  apartment TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  likes INTEGER NOT NULL DEFAULT 0,
  liked_by TEXT[] NOT NULL DEFAULT '{}',
  views INTEGER NOT NULL DEFAULT 0,
  viewed_by TEXT[] NOT NULL DEFAULT '{}',
  comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ocorrências leitura pública" ON ocorrencias
  FOR SELECT USING (true);

CREATE POLICY "Ocorrências inserir autenticado" ON ocorrencias
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Ocorrências atualizar autenticado" ON ocorrencias
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Ocorrências deletar autenticado" ON ocorrencias
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- BUCKET: ocorrencias
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ocorrencias',
  'ocorrencias',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Ocorrência imagem leitura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'ocorrencias');

CREATE POLICY "Ocorrência imagem upload autenticado"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ocorrencias'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Ocorrência imagem deletar autenticado"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ocorrencias'
  AND auth.uid() IS NOT NULL
);
