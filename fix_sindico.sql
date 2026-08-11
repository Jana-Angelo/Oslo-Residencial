insert into public.perfis (id, nome_completo, tipo_perfil, avatar_url, apartment_number)
select id, coalesce(raw_user_meta_data->>'full_name', email), 'sindico', null, raw_user_meta_data->>'apartment_number'
from auth.users
where email = 'SEU_EMAIL@EXEMPLO.COM'
on conflict (id) do update set tipo_perfil = 'sindico', updated_at = now();
