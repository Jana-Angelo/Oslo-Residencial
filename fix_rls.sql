do $$
declare t text;
begin
  foreach t in array array[
    'avisos','recomendacoes','pagamentos','resumo_financeiro','fluxo_mensal',
    'categorias_despesa','perfil_sindico','ocorrencias','perfis','moradores','unidades'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "%s_auth_all" on public.%I for all to authenticated using (true) with check (true)', t, t);
    execute format('create policy "%s_anon_read" on public.%I for select to anon using (true)', t, t);
  end loop;
end $$;
