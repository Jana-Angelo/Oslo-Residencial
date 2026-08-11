DROP TABLE IF EXISTS public.avisos;

CREATE TABLE public.avisos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  category_label TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date TEXT,
  time TEXT,
  author TEXT NOT NULL DEFAULT '',
  author_role TEXT,
  is_critical BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  details TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Avisos leitura publica" ON public.avisos
  FOR SELECT USING (true);

CREATE POLICY "Avisos inserir autenticado" ON public.avisos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Avisos atualizar autenticado" ON public.avisos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Avisos deletar autenticado" ON public.avisos
  FOR DELETE USING (auth.uid() IS NOT NULL);
