-- Tabela: ocorrencias
-- Rode este SQL no Supabase Dashboard > SQL Editor (no projeto rrjtznwdisrmejraxhgn).

create extension if not exists "pgcrypto";

create table if not exists public.ocorrencias (
  id uuid primary key default gen_random_uuid(),
  description text not null default '',
  category text not null default '',
  status text not null default 'Aberta',
  author_name text not null default '',
  apartment text not null default '',
  avatar_url text,
  images jsonb not null default '[]',
  likes integer not null default 0,
  liked_by jsonb not null default '[]',
  views integer not null default 0,
  viewed_by jsonb not null default '[]',
  comments jsonb not null default '[]',
  pinned boolean not null default false,
  highlighted boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices usados pelas consultas do app
create index if not exists ocorrencias_created_at_idx on public.ocorrencias (created_at desc);
create index if not exists ocorrencias_status_idx on public.ocorrencias (status);

-- =====================================================
-- RLS (OPCIONAL - recomendado antes de publicar)
-- As demais tabelas do projeto estao com RLS desabilitado.
-- Se quiser proteger apenas esta tabela, descomente abaixo:
-- =====================================================
-- alter table public.ocorrencias enable row level security;
--
-- create policy "ocorrencias_authenticated_all"
--   on public.ocorrencias
--   for all
--   to authenticated
--   using (true)
--   with check (true);
--
-- create policy "ocorrencias_anon_read"
--   on public.ocorrencias
--   for select
--   to anon
--   using (true);
