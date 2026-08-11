insert into storage.buckets (id, name, public) values
  ('avatars','avatars',true),
  ('recomendacoes','recomendacoes',true),
  ('ocorrencias','ocorrencias',true),
  ('arquivos_condominio','arquivos_condominio',true)
on conflict (id) do update set public = true;

do $$
declare b text;
begin
  foreach b in array array['avatars','recomendacoes','ocorrencias']
  loop
    execute format('create policy "%s_public_read" on storage.objects for select to public using (bucket_id = %L)', b, b);
    execute format('create policy "%s_auth_upload" on storage.objects for insert to authenticated with check (bucket_id = %L)', b, b);
    execute format('create policy "%s_auth_update" on storage.objects for update to authenticated using (bucket_id = %L)', b, b);
    execute format('create policy "%s_auth_delete" on storage.objects for delete to authenticated using (bucket_id = %L)', b, b);
  end loop;
end $$;
