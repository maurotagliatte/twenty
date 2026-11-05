# Prontidão para produção — fork Khard (`dev`)

Revisão feita em 2026-11-05, na branch `cursor/prod-readiness-4c83`, a partir de `dev`.
Nenhum deploy, restart ou alteração foi feito em Coolify, nem em `dev`/`main` remotos.
O PR aponta para `dev`, não para `main`.

## O que foi testado

Ambiente desta revisão: Node 26.12.1, Yarn 4.18.1. Não há Docker nesta VM.
Postgres 18.6 com `postgresql-18-pgvector` 0.8.7 e Redis 7 foram instalados no host.
A tag `pgvector/pgvector:0.8.7-pg18` existe no Docker Hub (atualizada em 2026-10-31).

| Pacote | Typecheck | Lint | Testes | Build |
| --- | --- | --- | --- | --- |
| `twenty-server` | passou (`tsgo --noEmit`, 0 erros) | passou (oxlint 0 erros, 5 avisos já existentes; oxfmt ok) | 1822 suítes / 12944 testes passaram. 2 suítes falharam, ver abaixo | `nx build twenty-server` passou |
| `twenty-front` | passou (`tsgo --noEmit`, 0 erros) | o único erro era `rgba()` em `AgentPresencePointer`; corrigido e o arquivo revalidado. oxfmt da árvore passou. 26 avisos de `no-twenty-ui-override` são anteriores | 1670 suítes / 9462 testes passaram | `nx build twenty-front` passou (`built in 48.35s`) |
| `khard-marketing` | passou | passou | 4 testes | `twenty@2.55.0 app build` passou |
| `khard-whatsapp` | passou | passou | 38 testes | `twenty@2.55.0 app build` passou |
| `khard-dam` | passou | passou | 108 testes | `twenty@2.55.0 app build` passou |
| `khard-wiki` | passou | passou | 59 testes | `twenty@2.55.0 app build` passou |
| `khard/edge-worker` | `node --test` passou (5) | sem projeto oxlint | 5 testes | não publicado (Worker à parte) |

Banco do zero, no Postgres 18 local:

1. `setup-db` criou `uuid-ossp`, `unaccent`, `citext` e `vector` em `public`.
2. `run-instance-commands --force --include-slow` terminou com sucesso, inclusive `2.56.0_EnableVectorExtensionFastInstanceCommand_1793779918381`.
3. `workspace:seed:dev` sincronizou o workspace (2 workspaces em `core.workspace`).
4. O servidor subiu e `GET /healthz` respondeu `{"status":"ok"}`.
5. A rota `POST /webhooks/messaging/cloudflare/inbound` foi registrada.

A suíte Jest de integração do comando `vector` não rodou: ela sobe o harness completo. O mesmo SQL rodou de verdade no cluster novo, e o spec unitário do comando passou.

Os quatro apps foram compilados pelo CLI. Não foram instalados no servidor local: isso exige login no CLI (`twenty app install`) e um workspace autenticado. No Coolify eles continuam instalados à parte do deploy, como o `KHARD.md` descreve.

### Falhas de teste que não são deste fork

- `local.driver.spec.ts` (2 testes): o checksum local é `inode-tamanho-mtime`. Os dois casos reescrevem o arquivo com o mesmo tamanho na mesma janela de `mtime`, e o `move` aceita. Reproduzido sozinho. O arquivo não está no diff `main...dev`.
- `prefer-workspace-scoped-repository-exemptions.spec.ts`: o `beforeAll` estourou 5 s com as duas suítes grandes em paralelo. Sozinho, 57 testes passaram.

## O que foi corrigido

- Worker `khard-edge`: metadado R2 com assunto acentuado era rejeitado (cabeçalho HTTP só aceita ASCII); agora vai percent-encoded. A chave do objeto usa o `Message-ID`, então um retry do Email Routing não importa a mensagem duas vezes. O webhook é esperado: HTTP diferente de 2xx falha a entrega e o Email Routing tenta de novo. `TWENTY_WEBHOOK_URL` e `WEBHOOK_SECRET` têm de estar os dois definidos ou os dois vazios.
- Cliente S3 do e-mail inbound: com endpoint customizado (R2) o cliente agora usa path-style, como o driver de arquivos já faz. Sem isso o GET do `.eml` no R2 falha mesmo com o webhook assinado.
- Ponteiro do agente: `rgba()` hardcoded quebrava o oxlint. A sombra usa `themeCssVariables.font.color.tertiary`.
- README do Khard Marketing: o redirect OAuth deixa de ser só `https://app.khard.cloud`. Cada ambiente registra o próprio `SERVER_URL`.
- Compose e runbook: aviso de que publicar este compose na produção cria um Postgres 18 vazio. O runbook registra o layout real do Coolify (apps, URLs, volumes, multi-workspace).

## Bloqueio número 1 — volume do Postgres

Os dois apps Coolify usam este compose, cada um na sua branch.

| | twenty-production | twenty-preview |
| --- | --- | --- |
| Branch | `main` | `dev` |
| URL | https://app.khard.cloud | https://twenty-dev.khard.cloud |
| Postgres no compose dessa branch | `postgres:16`, volume `twenty-pgdata` em `/var/lib/postgresql/data` | `pgvector/pgvector:0.8.7-pg18`, volume `twenty-pgdata-pg18` em `/var/lib/postgresql` |
| Multi-workspace | ligado | desligado (`IS_MULTIWORKSPACE_ENABLED=false`) |

Coolify prefixa o volume com o UUID do recurso. Publicar o compose do `dev` no app de produção **não abre** o volume antigo. Cria `twenty-pgdata-pg18` vazio, o PG18 faz `initdb`, o entrypoint do Twenty não acha o schema `core` e inicializa uma instância em branco. Os dados continuam no volume `twenty-pgdata`, intocados. Rollback existe enquanto ninguém passar a usar o banco novo. Procedimento completo em `packages/twenty-docker/docs/postgres-18-migration.md` e na seção de promoção abaixo.

## Multi-workspace

O diff do compose **não mexe** em `FRONTEND_URL` nem em `TWENTY_WORKSPACE_ROUTER_RULE`.

- `FRONTEND_URL` continua fora do bloco `environment`. Um default vazio falharia a validação `@IsUrl`. O env_file do Coolify injeta o valor. Produção precisa manter `https://khard.cloud`.
- `IS_MULTIWORKSPACE_ENABLED` e `DEFAULT_SUBDOMAIN` continuam interpolados (`true` / `app` na produção).
- O label Traefik continua `TWENTY_WORKSPACE_ROUTER_RULE`, com fallback `Host(\`twenty-workspaces.invalid\`)` se a variável sumir. "Escape special characters in labels" tem de seguir desligado.
- `SERVER_URL` da produção tem de ser `https://app.khard.cloud` (subdomínio default + `FRONTEND_URL`). Callbacks OAuth e o webhook do WhatsApp usam `SERVER_URL`, não o host do workspace. O runtime injeta `TWENTY_API_URL` com esse mesmo `SERVER_URL`.
- `twenty-preview` guarda `LOGIC_FUNCTION_TYPE` vazio. O compose usa `${LOGIC_FUNCTION_TYPE:-LOCAL}`, e `:-` trata vazio como `LOCAL`. Por isso o preview executa logic functions mesmo com o campo vazio no painel. No compose do `main` essa linha não existe: em produção o default do Twenty com `NODE_ENV=production` é `DISABLED`. O compose novo passa a ligar `LOCAL`. Não gravar `DISABLED` num ambiente que precise dos apps.

O preview foi exercitado com multi-workspace desligado. O código dos apps não escolhe o workspace pela URL do browser: o state assinado e o claim `phone_number_id → workspace` fazem isso. Isso não foi executado com um segundo workspace nesta revisão.

## Riscos que ainda ficam

1. **Crítico — banco vazio.** Deploy do compose novo na produção sem dump/restore. Ver bloqueio acima.
2. **Crítico — cursor de upgrade.** `dev` está 75 commits atrás de `main`. O comando `vector` tem timestamp `1793779918381`. Dois comandos que estão só no `main` ordenam **antes** dele e seriam pulados para sempre se o `vector` rodar primeiro no banco de produção:
   - `1793760000000` `add-tools-to-mcp-server`
   - `1793777543826` `create-billing-arrangement-table`
   Comandos do `main` com timestamp maior que `1793779918381` ainda rodariam depois. Não aplique este upgrade na produção antes de integrar esses 75 commits no mesmo release.
3. **Alto — multi-workspace não testado com os apps.** Repetir no preview, com a flag ligada, o login em `app`, um workspace `<cliente>.khard.cloud`, um OAuth e um webhook, antes de promover.
4. **Alto — segredos novos ausentes na produção.** A lista abaixo não está no app `twenty-production`. Sem eles os apps instalam e as rotas existem, mas conexão e inbound não funcionam. O webhook Cloudflare recusa entrega se `CLOUDFLARE_EMAIL_WEBHOOK_SECRET` estiver vazio (falha fechada). O WhatsApp recusa o POST sem `META_APP_SECRET`.
5. **Alto — WhatsApp ainda não está pronto para cliente externo.** App Review, Tech Provider, `account_update` e Data Use Checkup seguem abertos no `KHARD.md`. Embedded Signup no preview não autoriza produção.
6. **Médio — Worker ainda no comportamento antigo até um `wrangler deploy`.** O código desta branch só vale depois do deploy do Worker. Enquanto `TWENTY_WEBHOOK_URL` / `WEBHOOK_SECRET` estiverem vazios, o Worker só guarda o `.eml` no R2.
7. **Médio — rate limit de logic function.** O default é 500 req/min somados de todos os workspaces do app. O README do WhatsApp pede `APPLICATION_API_RATE_LIMITING_LIMIT=6000`.
8. **Médio — `down` do comando `vector` faz `DROP EXTENSION`.** Não há coluna `vector` ainda. Se um dia houver, o rollback do comando falha em vez de apagar dados (não usa `CASCADE`). Não rode o `down` em produção.
9. **Baixo — Marketing e WhatsApp são dois apps Meta.** Segredos e redirects são distintos. Não reutilize o app secret de um no outro.
10. **Baixo — ponteiro do agente.** Flag `IS_AGENT_UI_PRESENCE_ENABLED` desligada por padrão. O seeder de desenvolvimento liga. Não é variável de ambiente.

Assinaturas revistas, sem mudança de código além do que está acima:

- WhatsApp: `X-Hub-Signature-256` com HMAC-SHA256 do raw body e comparação em tempo constante. Sem segredo, responde 500 e não processa. Handshake `hub.verify_token` no GET.
- Cloudflare inbound: HMAC-SHA256 de `${timestamp}.${body}`, janela de 5 minutos, sem segredo a rota recusa. O Worker assina o mesmo formato.

Não achei segredo hardcoded. `khard/edge-worker/wrangler.jsonc` tem o `account_id` da Cloudflare (identificador da conta, não uma chave).

## Variáveis que a produção precisa

### Já estão no Coolify e têm de continuar

| Variável | Valor atual a preservar |
| --- | --- |
| `SERVER_URL` | `https://app.khard.cloud` |
| `FRONTEND_URL` | `https://khard.cloud` |
| `IS_MULTIWORKSPACE_ENABLED` | `true` |
| `DEFAULT_SUBDOMAIN` | `app` |
| `TWENTY_WORKSPACE_ROUTER_RULE` | a regra Traefik já configurada, literal |
| `SERVICE_PASSWORD_POSTGRES` | gerado pelo Coolify; não rotacionar no meio da migração |
| `SERVICE_BASE64_64_APPSECRET` | vira `APP_SECRET` no compose |
| `SERVICE_FQDN_SERVER`, `SERVICE_URL_SERVER` | injetados pelo Coolify |

O compose também define, sem aparecer no painel: `PG_DATABASE_URL`, `REDIS_URL`, `STORAGE_TYPE=local`, `NODE_PORT=3000`, `DISABLE_DB_MIGRATIONS` (`false` no server, `true` no worker), `DISABLE_CRON_JOBS_REGISTRATION` (o contrário), `LOGIC_FUNCTION_TYPE=LOCAL`.

### Processo do servidor — canais de e-mail (quando forem ligar)

```bash
LOGIC_FUNCTION_TYPE=LOCAL
APPLICATION_API_RATE_LIMITING_LIMIT=6000

MESSAGING_PROVIDER_GMAIL_ENABLED=true
CALENDAR_PROVIDER_GOOGLE_ENABLED=true
AUTH_GOOGLE_CLIENT_ID=
AUTH_GOOGLE_CLIENT_SECRET=
AUTH_GOOGLE_APIS_CALLBACK_URL=https://app.khard.cloud/auth/google-apis/get-access-token
AUTH_GOOGLE_ENABLED=true
AUTH_GOOGLE_CALLBACK_URL=https://app.khard.cloud/auth/google/redirect

MESSAGING_PROVIDER_MICROSOFT_ENABLED=true
CALENDAR_PROVIDER_MICROSOFT_ENABLED=true
AUTH_MICROSOFT_CLIENT_ID=
AUTH_MICROSOFT_CLIENT_SECRET=
AUTH_MICROSOFT_APIS_CALLBACK_URL=https://app.khard.cloud/auth/microsoft-apis/get-access-token
AUTH_MICROSOFT_ENABLED=true
AUTH_MICROSOFT_CALLBACK_URL=https://app.khard.cloud/auth/microsoft/redirect
```

Push do Gmail, se for usar: `IS_CONNECTED_ACCOUNT_WEBHOOK_SUBSCRIPTION_ENABLED`, `MESSAGING_GMAIL_PUBSUB_TOPIC`, `MESSAGING_GMAIL_PUBSUB_VERIFICATION_EMAIL`. Detalhe em `packages/twenty-docker/channels-setup.md`.

### Processo do servidor — e-mail inbound Cloudflare

`STORAGE_TYPE` pode continuar `local` para arquivos. O inbound usa outro cliente S3, apontando para o R2.

| Variável | Função |
| --- | --- |
| `CLOUDFLARE_EMAIL_WEBHOOK_SECRET` | o mesmo valor de `WEBHOOK_SECRET` do Worker |
| `INBOUND_EMAIL_S3_BUCKET` | `khard-inbound` |
| `INBOUND_EMAIL_DOMAIN` | domínio à direita de `ch_xxx@…` dos canais email group |
| `STORAGE_S3_REGION` | `auto` no R2 |
| `STORAGE_S3_ENDPOINT` | `https://<accountid>.r2.cloudflarestorage.com` |
| `STORAGE_S3_ACCESS_KEY_ID` | token R2 com leitura do bucket |
| `STORAGE_S3_SECRET_ACCESS_KEY` | segredo desse token |

### Worker `khard-edge` (não é env do Twenty)

| Nome | Função |
| --- | --- |
| `WEBHOOK_SECRET` | igual a `CLOUDFLARE_EMAIL_WEBHOOK_SECRET` |
| `TWENTY_WEBHOOK_URL` | `https://app.khard.cloud/webhooks/messaging/cloudflare/inbound` |
| binding `INBOUND` | bucket R2 `khard-inbound` |
| binding `ROUTES` | KV opcional: endereço do cliente → endereço `ch_xxx@` do canal |

### Variáveis de app (Settings → Apps, não env do processo)

WhatsApp, uma vez, como server admin:

- `META_APP_ID`
- `META_APP_SECRET`
- `WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

Khard Marketing, uma vez, como server admin:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `META_APP_ID`
- `META_APP_SECRET`
- `WHATSAPP_SYSTEM_USER_TOKEN` (opcional; não é o token do Embedded Signup)

Redirects a cadastrar no console, com o `SERVER_URL` de **produção**:

- Google Marketing: `https://app.khard.cloud/auth/apps/callback`
- Meta Marketing: `https://app.khard.cloud/auth/apps/custom/callback`
- WhatsApp: a URL de servidor do resolver (está no README do app) e o mesmo host em Allowed domains / Valid OAuth redirect URIs

O preview usa `https://twenty-dev.khard.cloud` nos mesmos caminhos. Não apontar o app de produção para o host de dev.

### Ponteiro do agente

Não é env. Flag de workspace `IS_AGENT_UI_PRESENCE_ENABLED`, mais a chave do provedor de IA que o workspace já usaria (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY` ou `GOOGLE_API_KEY`).

## Plano de promoção

Não fazer merge deste PR em `main`. Não ligar o auto-deploy de `twenty-production` enquanto o plano não chegar no passo 8.

1. **Integrar o `main` no `dev` antes de qualquer upgrade do banco de produção.** São 75 commits, entre eles os dois comandos de instância citados no risco 2. Sem isso, o comando `vector` marca o cursor e esses dois nunca rodam. Resolver conflitos, rodar de novo typecheck do server e `run-instance-commands` num banco vazio.
2. **Desligar o deploy automático** do app `twenty-production` no Coolify.
3. **Backup, ainda no Postgres 16.** Janela com `server` e `worker` parados. Disco livre ≥ 3× o tamanho do banco.
   ```bash
   docker ps --format '{{.Names}}\t{{.Image}}' | grep -E 'postgres|twenty'
   docker volume ls | grep pgdata
   docker exec <db16> psql -U postgres -d default -Atc "SELECT pg_size_pretty(pg_database_size('default'))"
   mkdir -p /root/twenty-pg-migration && cd /root/twenty-pg-migration
   docker exec <db16> pg_dump -U postgres -d default -Fc -Z 6 -f /tmp/default.dump
   docker cp <db16>:/tmp/default.dump ./default.dump
   docker exec <db16> pg_dumpall -U postgres --roles-only > roles.sql
   docker exec <db16> psql -U postgres -d default -Atc \
     "SELECT nspname, count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE relkind = 'r' AND nspname NOT IN ('pg_catalog', 'information_schema') GROUP BY 1 ORDER BY 1" > counts-16.txt
   docker exec <db16> pg_restore -l /tmp/default.dump > /dev/null && echo "dump readable"
   ```
   Copiar `default.dump` e `counts-16.txt` para fora do host antes de seguir. Não colar `SERVICE_PASSWORD_POSTGRES` no histórico: `docker exec` usa o socket local.
4. **Conferir que não há escritor.** `server` e `worker` parados. A query de `pg_stat_activity` do runbook tem de voltar `0`.
5. **Subir só o Postgres 18.** Publicar o compose novo. Se o Coolify subir `server` e `worker` junto, pará-los de novo antes de terminarem o boot. Dropar o `default` que eles tenham criado:
   ```bash
   docker exec <db18> psql -U postgres -d postgres -c 'DROP DATABASE IF EXISTS "default" WITH (FORCE)'
   docker exec <db18> psql -U postgres -d postgres -c 'CREATE DATABASE "default"'
   docker exec <db18> psql -U postgres -Atc 'SHOW server_version' -c 'SHOW data_directory'
   ```
   Esperado: `18.x` e `/var/lib/postgresql/18/docker`.
6. **Restaurar.**
   ```bash
   docker cp ./default.dump <db18>:/tmp/default.dump
   docker exec <db18> psql -U postgres -d default -c 'CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public'
   docker exec <db18> pg_restore -U postgres -d default --no-owner --role=postgres -j 4 --exit-on-error /tmp/default.dump
   ```
   O compose deste fork só tem o papel `postgres`. `roles.sql` só entra se o cluster antigo tiver outros papéis; nesse caso, aplicar antes do `pg_restore` e tirar `--no-owner`.
7. **Conferir antes de abrir o app.**
   ```bash
   docker exec <db18> psql -U postgres -d default -Atc \
     "SELECT nspname, count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE relkind = 'r' AND nspname NOT IN ('pg_catalog', 'information_schema') GROUP BY 1 ORDER BY 1" > counts-18.txt
   diff counts-16.txt counts-18.txt && echo "table counts match"
   docker exec <db18> psql -U postgres -d default -Atc "SELECT extname, extversion FROM pg_extension ORDER BY 1"
   docker exec <db18> psql -U postgres -d default -Atc 'SELECT count(*) FROM core.workspace' -c 'SELECT count(*) FROM core."user"'
   docker exec <db18> psql -U postgres -d default -Atc "SELECT '[1,2,3]'::public.vector OPERATOR(public.<->) '[1,2,4]'::public.vector"
   docker exec <db18> vacuumdb -U postgres -d default --analyze-only
   ```
   Contagens iguais, extensões `citext`, `plpgsql`, `unaccent`, `uuid-ossp` e `vector`, mesmos totais de workspace e user, distância `1`.
8. **Subir `server` e `worker`.** Log com migração concluída. `GET https://app.khard.cloud/healthz`. Entrar em `app.khard.cloud`, abrir um workspace `<cliente>.khard.cloud`, uma busca e alguns registros. O comando `vector` vira no-op porque a extensão já existe.
9. **Smoke dos recursos novos, só depois dos segredos correspondentes.** Sem segredo, o esperado é falha fechada, não dados novos.
   - `POST /webhooks/messaging/cloudflare/inbound` sem assinatura → 4xx.
   - WhatsApp: handshake do verify token e uma mensagem de teste no número já conectado no preview, não num cliente.
   - Instalar DAM, Wiki, Marketing e WhatsApp no workspace de produção (o install não vai no deploy da imagem).
   - Confirmar que o label Traefik dos subworkspaces continua casando e que o host `app.khard.cloud` não caiu no catch-all.
10. **Rollback.** Enquanto as escritas novas não importam: parar o stack e republicar o compose anterior (`postgres:16`, volume `twenty-pgdata` em `/var/lib/postgresql/data`). Esse volume não foi modificado. Não apagar `twenty-pgdata` nem `default.dump` neste dia. Jobs de backup passam a usar `pg_dump` de cliente 18 só depois que o stack novo estiver estável.

Ordem que não vale: merge do `dev` no `main` com auto-deploy ligado, ou restore depois que o Twenty já inicializou o banco vazio e alguém criou workspace nele.
