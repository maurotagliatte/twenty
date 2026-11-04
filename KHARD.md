# Fork Khard do Twenty: estado do trabalho

Registro do que foi construído neste fork, como está implantado e o que falta.
As decisões de arquitetura (D1 a D12) ficam no documento de decisões:
https://claude.ai/artifact/YH9jbbNruKEhPg4JBoQpHG. Este arquivo não repete
essas decisões, só aponta o estado de cada frente.

Atualizado em 2026-11-04.

## Direção

- SaaS multi-tenant: uma instância, vários workspaces. Cada cliente conecta as
  próprias contas (e-mail, WhatsApp, Google, Meta); segredos de instância ficam
  só em variáveis do servidor.
- Preferência por apps do SDK do Twenty, sidecars sem estado e patches de core
  pequenos e isolados.
- Apps ficam em `packages/twenty-apps/internal/khard-*`; cada um tem um README
  com modelo de dados, telas, papéis e comandos.

## Ambientes

| Ambiente | Onde | Regra |
| --- | --- | --- |
| Dev | https://twenty-dev.khard.cloud, app Coolify `ckxvqhc9jvvre7lugux9q81h`, branch `dev` com deploy automático | Livre para testes |
| Produção | branch `main` | Só leitura: nenhum deploy, restart, mudança de env ou migração |

Os apps são instalados no dev com `npx twenty@2.55.0 app apply -r default --no-input`
a partir da pasta de cada app. Isso não depende do deploy da branch.

## Branch e commits

Branch de trabalho: `feat/pg18-dam-channels-presence`.

| Commit | Conteúdo | Onde está |
| --- | --- | --- |
| `93af3254cf` | Postgres 18 com pgvector | `dev` |
| `e43960bea2` | App DAM & BAM: objetos, visões e menu | `dev` |
| `b261bb91b1` | App WhatsApp via Meta Embedded Signup | `dev` |
| `deae6f1e34` | Ponteiro ao vivo das ações do agente (Yjs) | `dev` |
| `4d71df6ff6` | DAM: Asset browser e brand kit | branch remota |
| `897b53c7f0` | App Wiki com árvore de páginas | branch remota |
| `8945ed5e70` | Wiki: páginas como documentos com árvore fixa | só local |
| `37d98b37b8` | DAM: cards de prévia e grade de coleções | só local |
| `60b1477885` | DAM: papel do app com leitura dos objetos | só local |

O app Khard Marketing (`9dfc860eb2`, conexões Google e Meta) é anterior a esta branch.

## O que foi feito

### Postgres 18 com pgvector

- Compose, podman, CI e setup de dev em `pgvector/pgvector:0.8.7-pg18`, com o
  layout de volume do PG18.
- Extensão `vector` habilitada por um comando de instância da 2.56 e em
  instalações novas.
- Runbook de migração PG16 para PG18: `packages/twenty-docker/docs/postgres-18-migration.md`.
- Aplicado no dev. Produção continua no PG16 até haver um backup testado.

### DAM & BAM (`khard-dam`)

- Objetos nativos: Asset, Collection, Collection asset (junção) e Brand, com
  relações para Empresa, Pessoa e membro da equipe.
- Visões nativas: Review board (kanban por status), Approved library, Brand
  logos e direitos de uso vencendo ou vencidos.
- Asset browser com três abas: Gallery (cards com filtros e busca), Brand kits
  e Collections (grade de capas que abre os assets da coleção).
- Cards no formato de prévia: fundo colorido pelo tipo de arquivo, folha com a
  mídia ou um esqueleto de documento, rodapé com ícone, status e data.
- Papéis: Brand manager e Asset contributor, sem exclusão definitiva. O papel
  do app tem só leitura nos objetos do DAM; sem isso as telas não carregam.

### Wiki (`khard-wiki`)

- Objetos Wiki space e Wiki page (hierarquia por página pai, dono, status,
  datas de revisão, tags, capa).
- Cada página abre como documento: árvore de páginas fixa na coluna da
  esquerda, cabeçalho com capa, ícone e título editáveis, dono, atualização,
  status e subpáginas, e o editor nativo ocupando o resto da tela.
- Menu reduzido a Wiki home, Wiki spaces e Wiki pages; as visões Drafts, Needs
  review, Pages by space e Recently updated ficam dentro de Wiki pages.
- Wiki home abre a página atualizada mais recentemente.

### WhatsApp (`khard-whatsapp`)

- Cada workspace conecta o próprio número pelo Embedded Signup da Meta.
- Rotas de servidor para a página de cadastro, o callback e o webhook, com
  verificação da assinatura `x-hub-signature-256`.
- Após o cadastro, o app inscreve o app na WABA e registra o número.
- O popup do Embedded Signup funciona no dev desde 2026-11-04.
- Configuração da Meta e limites: README do app.

### E-mail e calendário

- Conexão nativa do Twenty por OAuth (Google e Microsoft) por workspace.
- Variáveis e passo a passo dos consoles: `packages/twenty-docker/channels-setup.md`.

### Ponteiro do agente

- As chamadas de ferramenta do agente viram eventos de presença, mostrados no
  front como um participante Yjs que aponta para o campo, registro ou item de
  menu afetado. Atrás da flag `IS_AGENT_UI_PRESENCE_ENABLED`.

## Dados de exemplo no dev

Criados para avaliação, todos marcados com "exemplo" (tag nas páginas da Wiki,
palavra-chave nos assets e na descrição "Exemplo: ...").

- Wiki: 3 espaços (Comercial, Marketing, Operações) e 16 páginas aninhadas.
- DAM: marcas Aurora Café e Boreal Fitness, 4 coleções com capa e 14 assets
  com arquivo (fotos do Unsplash, logos em SVG, um PDF). O "Vídeo teaser 15s"
  ficou sem arquivo de propósito.

Para apagar, filtre por "exemplo" em cada objeto.

## Pendências

### WhatsApp e Meta

- [ ] Confirmar qual número e qual portfólio foram conectados no teste. A
      verificação mostrou nenhuma WABA do portfólio Khard Marketing inscrita no
      app Khard-Twenty.
- [ ] Enviar uma mensagem de teste e acompanhar o webhook no dev.
- [ ] Inscrever o campo `account_update` no webhook.
- [ ] Concluir o onboarding de Tech Provider e o App Review de
      `whatsapp_business_management` e `whatsapp_business_messaging`, necessários
      para clientes externos.
- [ ] Concluir o Data Use Checkup.
- [ ] Limpar os casos de uso que não servem ao app ou criar um app limpo.

### E-mail

- [ ] Criar o cliente OAuth no Google Cloud e o app no Microsoft Entra.
- [ ] Definir as variáveis no dev pelo Coolify e testar a conexão de caixas.

### Testes no dev

- [ ] Configurar a chave do provedor de IA e testar o ponteiro do agente.
- [ ] Revisar visualmente o DAM depois da correção do papel do app.

### Wiki

- [ ] Fase 2: comentários por página (abertos, atribuídos a mim, resolvidos) e
      contribuidores.
- [ ] Extrair links entre páginas das menções do corpo para um objeto de arestas.
- [ ] Textos das telas estão em inglês, como o resto do app; decidir se traduz.
- [ ] Limite conhecido: o cabeçalho só reflete uma edição feita no cartão
      nativo depois de recarregar.

### DAM

- [ ] Regra no servidor para que só o Brand manager aprove; hoje o status é um
      campo que qualquer contribuidor muda.
- [ ] Reduzir o menu (8 itens) para Assets, Collections e Brands, como na Wiki.
- [ ] Miniatura real de PDF e extração de largura, altura e duração, geradas no
      servidor após o upload.
- [ ] Upload de vários arquivos de uma vez exigiria patch no core.

### Decisões em aberto

- [ ] Cobrança e papéis de DAM e Wiki: papéis atribuíveis exigem o recurso de
      papéis customizados quando a cobrança está ligada.
- [ ] Prefixo `dam` nos nomes de API.
- [ ] Tags fixas ou livres.
- [ ] D10: busca semântica como módulo isolado do core.
- [ ] D12: provedor de embeddings.

### Infra

- [ ] Migrar produção para o PG18 só depois de um backup testado.
- [ ] Clone de produção para testes está pausado.
- [ ] Levar a branch para `dev` (os três últimos commits estão só locais).
