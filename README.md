# Khard para Twenty

Apps, worker e infraestrutura da Khard sobre o [Twenty](https://github.com/twentyhq/twenty).
O Twenty roda pela imagem oficial `twentycrm/twenty`; este repositório não
contém código do Twenty.

| Pasta | Conteúdo |
| --- | --- |
| `apps/dam` | DAM & BAM: assets, coleções e marcas, com galeria visual |
| `apps/wiki` | Wiki: espaços e páginas em árvore, cada página como documento |
| `apps/whatsapp` | Canal de WhatsApp por workspace via Embedded Signup da Meta |
| `apps/marketing` | Conexões Google e Meta por workspace |
| `workers/inbound-email` | Worker Cloudflare que recebe e-mail dos domínios dos clientes |
| `infra/coolify` | Stack do Coolify com a imagem oficial |
| `infra/migration` | Backup, verificações e saída do fork antigo |
| `docs` | Configuração de canais e histórico do fork |

## Apps

Todos os apps seguem o mesmo layout e são independentes: cada um tem
`package.json`, `yarn.lock`, `.nvmrc` (Node 24), `README.md` e `src/`.

```bash
cd apps/<app>
yarn install
yarn lint && yarn typecheck && yarn test
npx twenty@<versão do servidor> app apply --create
```

Use o CLI na mesma versão do servidor. O README de cada app descreve o
modelo de dados, as telas, os papéis e as variáveis.

## Atualizar o Twenty

Trocar `TWENTY_IMAGE_TAG` no Coolify para uma tag publicada, com backup antes.
Nunca usar `latest` nem o `main` do Twenty.
