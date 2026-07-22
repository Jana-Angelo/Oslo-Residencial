-- =====================================================
-- MIGRATION: Políticas RLS para Supabase Storage
-- Buckets: avatars e recomendacoes
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- BUCKET: avatars
-- =====================================================

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública para todos
CREATE POLICY "Avatar leitura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Upload apenas para usuários autenticados
CREATE POLICY "Avatar upload autenticado"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
);

-- Deletar apenas o próprio avatar (ou admin)
CREATE POLICY "Avatar deletar autenticado"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
);

-- Atualizar apenas o próprio avatar
CREATE POLICY "Avatar atualizar autenticado"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
);

-- =====================================================
-- BUCKET: recomendacoes
-- =====================================================

-- Criar bucket se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recomendacoes',
  'recomendacoes',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública para todos
CREATE POLICY "Recomendação leitura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'recomendacoes');

-- Upload apenas para usuários autenticados
CREATE POLICY "Recomendação upload autenticado"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'recomendacoes'
  AND auth.uid() IS NOT NULL
);

-- Deletar apenas autor autenticado
CREATE POLICY "Recomendação deletar autenticado"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'recomendacoes'
  AND auth.uid() IS NOT NULL
);
