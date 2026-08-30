# Guia de Produção — Oslo Residencial

Passo a passo para subir o portal em produção e liberar para o cliente final.

> **Pré-requisito de código já resolvido:** o build de produção (`npm run build`) e o lint (`npm run lint`) passam. A tabela `ocorrencias` estava ausente no Supabase (SQL pronto em `supabase/ocorrencias.sql`) e os dados demo foram zerados em `src/data.ts`.

---

## 1. Criar a tabela `ocorrencias` no Supabase (obrigatório)

O módulo de Ocorrências não persiste enquanto a tabela não existir.

1. Acesse https://supabase.com/dashboard e entre no projeto `rrjtznwdisrmejraxhgn`.
2. No menu esquerdo, clique em **SQL Editor**.
3. Abra o arquivo `supabase/ocorrencias.sql` deste repositório, cole o conteúdo e clique em **Run** (rodar uma única vez).
4. Confira em **Table Editor** que a tabela `ocorrencias` aparece.

Teste rápido (opcional): abra o app, publique uma ocorrência e verifique se ela aparece em
`https://rrjtznwdisrmejraxhgn.supabase.co/rest/v1/ocorrencias?select=*`.

---

## 2. Configurar variáveis de ambiente na hospedagem (obrigatório)

O Vite embute `VITE_*` no build. O `.env` local é gitignorado, então as variáveis **precisam ser
configuradas no painel da hospedagem** antes do primeiro build.

Copie do seu `.env`:

| Variável | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://rrjtznwdisrmejraxhgn.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | a chave `anon` do projeto (começa com `eyJ...`) |

Onde configurar:

- **Vercel:** projeto > **Settings** > **Environment Variables** > adicione as duas > **Deploy**.
- **Netlify:** **Site configuration** > **Environment variables** > adicione > **Deploy**.
- **Cloudflare Pages:** projeto > **Settings** > **Environment variables** > adicione > **Deploy**.
- **Render/outros:** equivalente em **Environment**.

Após salvar, **faça um novo deploy** (o build já passa as vars para o bundle).

> A chave `anon` é pública por design no Supabase (é o padrão para apps client-side). Segurança é
> garantida pelo RLS — item 3.

---

## 3. Ativar RLS (Row Level Security) — recomendado

Hoje as tabelas estão com RLS **desabilitado**: qualquer pessoa com a chave anon pode ler e gravar
tudo. Ative RLS para que apenas usuários **logados** possam escrever.

Execute no **SQL Editor** do Supabase (uma única vez):

```sql
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
```

- **authenticated** (usuários logados): podem ler/escrever — igual ao comportamento atual.
- **anon** (não logados): só leitura — o app só busca dados após o login.

### Storage (avatars, imagens de recomendações e ocorrências)

Garanta que os buckets existam, sejam públicos e permitam upload de usuários logados
(execute uma única vez):

```sql
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
```

> Se já existirem políticas com os mesmos nomes (ex.: `avatars_public_read`), o script falhará.
> Nesse caso, remova as políticas duplicadas ou ajuste os nomes antes de rodar.

### Verificação pós-RLS

Com um usuário logado: cadastre um aviso e uma ocorrência → deve gravar.
Sem login: o app mostra apenas a tela de login → sem acesso aos dados.

---

## 4. Confirmação de e-mail no cadastro (recomendado)

O Supabase pode exigir que o usuário confirme o e-mail antes do primeiro login.

1. Em **Authentication** > **Sign In / Providers** > **Email**, veja o toggle **Confirm email**.
2. **Desativado** (recomendado para o lançamento): o cadastro já permite login imediato —
   combina com a mensagem atual "Agora você já pode acessar o portal".
3. **Ativado**: o usuário recebe um link de confirmação. O cliente só conseguirá logar após
   clicar no link. Ajuste a mensagem de sucesso do cadastro para avisar disso.

> No plano gratuito do Supabase há limite de e-mails por hora. Se ativar, acompanhe em
> **Authentication** > **Emails** para não atingir o limite com muitos cadastros novos.

---

## 5. PWA — instalação como app (recomendado)

O portal já gera PWA (Service Worker + manifest) no build. Para o cliente instalar
como app no celular, garanta:

1. **Ícone do app**: hoje os PNGs em `public/icons/` são uma marca provisória gerada por
   `scripts/generate-icons.mjs`. Para usar o artefato oficial, substitua os arquivos
   `public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png` (512, fundo cheio
   para `maskable`) e `apple-touch-icon.png` (180, fundo cheio) e rode `npm run build`.
2. **Deploy no Netlify**: o `netlify.toml` já protege `/sw.js` e `/manifest.webmanifest`
   do redirect SPA e define o cache correto do `sw.js` (não alterar).
3. **Teste rápido** (após o deploy com HTTPS):
   - Chrome/Android: abra o site → menu "Instalar app" no perfil (ou ⋮ do navegador).
   - iPhone/iPad: menu do perfil → "Adicionar à tela de início" (Safari).
   - Lighthouse (abas de auditoria do DevTools) → seção PWA.
4. **Atualizações**: o Service Worker usa `autoUpdate` — ao abrir o app instalado, novas
   versões são baixadas e aplicadas automaticamente. Como as fontes do Google entram no
   cache em runtime, o app mantém o visual mesmo offline após a primeira visita.

---

## Checklist final antes de entregar ao cliente

- [ ] Tabela `ocorrencias` criada (item 1)
- [ ] `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` configuradas na hospedagem (item 2)
- [ ] Deploy feito e app abrindo no domínio final
- [ ] Login e cadastro funcionando no domínio de produção
- [ ] RLS ativo nas tabelas e buckets (item 3, recomendado)
- [ ] Decisão tomada sobre confirmação de e-mail (item 4)
- [ ] Ícone oficial do app em `public/icons/` substituído (item 5)
- [ ] Teste de instalação PWA no Android (Chrome) e iOS (Safari) (item 5)
- [ ] Dados reais alimentados (o banco está vazio — sem ocorrências, avisos, fluxo, etc., o app
      aparecerá vazio de propósito após a limpeza dos dados demo)
