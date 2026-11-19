# Sair do fork: Twenty oficial + apps Khard

Proposta de 2026-11-19: a produção passa a usar a imagem oficial
`twentycrm/twenty`. Os apps Khard (`packages/twenty-apps/internal/khard-*`)
são instalados pelo SDK, como em qualquer instância do Twenty. Este
repositório fica só com os apps, o edge worker e a infraestrutura.

## O que foi testado (2026-11-19)

Ensaio em containers, num banco do 2.56.1 oficial com os registros próprios
do fork (cursor de upgrade e flag `IS_AGENT_UI_PRESENCE_ENABLED`):

1. 2.59.3 oficial sem limpeza: o `upgrade` aborta com
   `Step "2.56.0_ReplayInstanceSchemaSkippedByUpgradeCursorCommand_1793895100000" not found`.
2. `cleanup-for-vanilla.sql` e depois 2.59.3: upgrade OK nos dois workspaces,
   servidor saudável, dados existentes legíveis.
3. `npx twenty@2.59.0 app apply --create` dos quatro apps: todos instalados.
   O DAM precisa do worker rodando (operações de schema adiadas).
4. Wiki (árvore de páginas, página como documento) e DAM (Asset browser)
   renderizam no front oficial; registros criados por REST em `wikiSpaces`,
   `wikiPages` e `damBrands`.
5. WhatsApp: a rota do servidor executa o código do app e recusa sem
   `META_APP_SECRET`, como esperado.

Fora do ensaio: o banco real de produção (o MCP do Postgres estava fora do
ar), conexões reais com Meta e Google e arquivos reais.

## Sequência

1. **Congelar.** No Coolify, desligar o auto-deploy do `twenty-production`.
   Anotar qual imagem e qual volume o serviço `db` usa:
   `docker ps --format '{{.Names}}\t{{.Image}}'`, `docker volume ls | grep pgdata`.
   Exportar todas as variáveis do app, incluindo `SERVICE_BASE64_64_APPSECRET`,
   para um cofre.
2. **Backup.** `backup.sh` (para server e worker, `pg_dump` em formato custom e
   texto, papéis, `tar` dos arquivos, `checks.sql`, sha256). Copiar para fora
   do host.
3. **Staging.** App novo no Coolify com `docker-compose.coolify.vanilla.yml`,
   outro domínio, `TWENTY_IMAGE_TAG=v2.59.3` (ou a tag mais recente) e
   `APP_SECRET` = o da produção. Antes do primeiro boot:
   - restore: `pg_restore --no-owner -d default default.dump` (se a produção
     estiver em PG18, usar `default.sql` com `psql`);
   - extrair `local-storage.tar.gz` no volume `twenty-vanilla-local-storage`;
   - `psql -f checks.sql`, depois `psql -f cleanup-for-vanilla.sql`.
4. **Primeiro boot** do staging. Conferir no log
   `event=summary totalSuccesses=N totalFailures=0`. O entrypoint imprime
   "Successfully migrated DB!" mesmo quando o upgrade falha, então essa linha
   não serve de critério.
5. **Apps.** Em cada `khard-*`: `npx twenty@<versão do servidor> app apply --create`
   contra o remote do staging. Fazer login, abrir Wiki, DAM, Referências e
   Roteiros, e conferir uma conta conectada.
6. **Corte.** Janela anunciada: backup final, repetir os passos 3 a 5 no app
   definitivo, apontar `app.khard.cloud` e os subdomínios dos workspaces para
   ele. Manter o `twenty-production` parado e intacto por 7 dias.
7. **Depois.** Backup diário fora do host, teste de restore mensal. Atualizar é
   trocar a tag, sempre para uma tag publicada, nunca para o `main`.

## O que se perde e como substituir

| Recurso do fork | Situação em produção | Substituição |
| --- | --- | --- |
| E-mail de entrada pelo Cloudflare Email Routing (R2 + webhook) | Canal `intervenha@mail.khard.cloud`, 2 mensagens | Driver oficial AWS SES, ou propor o patch (~250 linhas) ao upstream |
| Ponteiro do agente ao vivo | Atrás de flag, nunca validado em produção | Nenhuma; descartar |
| Postgres 18 + pgvector | Nada usa vector | Postgres 16, como no compose oficial |

## Riscos em aberto

- `LOGIC_FUNCTION_TYPE=LOCAL`: o código dos apps roda no host sem sandbox e
  enxerga o `APP_SECRET`. Aceitável enquanto só os apps Khard estiverem
  instalados; antes de deixar clientes instalarem apps, usar um driver isolado.
- Os apps fixam `twenty-sdk` 2.55.0. Ao subir para 2.59+, trocar
  `folderUniversalIdentifier` por `parentUniversalIdentifier` nos itens de
  menu (o servidor ainda aceita o campo antigo).
