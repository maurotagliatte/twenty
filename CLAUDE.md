# CLAUDE.md

Apps da Khard sobre o Twenty, construídos com o `twenty-sdk`. O Twenty roda
pela imagem oficial; não há código do Twenty aqui. Mapa das pastas: `README.md`.

## Regras

- Um app nunca importa de `twenty-shared`; tudo vem de `twenty-sdk`.
- `universalIdentifier` é estável: nunca troque um já publicado, ou o app
  apaga e recria o item no workspace (com perda de dados em campos e objetos).
- Barra lateral: uma entrada por destino (página ou objeto). Visões e filtros
  ficam no seletor de visões do objeto, nunca como item de menu.
- Antes de modelar, verifique se um conceito nativo do Twenty já resolve
  (anexos, notas, tarefas, timeline, pessoas, empresas, membros).
- Comentários só para o porquê, curtos. Tipos em vez de interfaces, sem `any`,
  exports nomeados.
- Strings visíveis em inglês até decidirmos a tradução.

## Comandos (dentro de `apps/<app>`)

```bash
yarn install
yarn lint && yarn typecheck && yarn test
npx twenty@<versão do servidor> app apply --create
```

Worker: `cd workers/inbound-email && npm test`.

## Produção

Nenhum deploy, migração ou `app apply` em produção sem pedido explícito.
Sequência de mudança de versão e backup: `infra/migration/README.md`.
