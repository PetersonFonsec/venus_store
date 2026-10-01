# Use Vênus

Vitrine O Boticário com curadoria e opinião da consultora. Pedidos pelo WhatsApp.

Angular 19 com saída **estática** (`outputMode: "static"`): no build todas as rotas —
inclusive uma página por produto — são pré-renderizadas em `dist/venus-store/browser`.

## Rodando

```bash
npm install
npm start          # dev em http://localhost:4200
npm run build      # gera o site estático
```

## Onde fica cada coisa

| Caminho | O quê |
| --- | --- |
| `src/app/core/data/catalog.mock.ts` | Conteúdo de exemplo (produtos, opinião, dados da vendedora, WhatsApp) |
| `src/app/core/models/product.model.ts` | Formato dos dados — espelha os custom types que irão para o Prismic |
| `src/app/core/services/catalog.service.ts` | Única porta de leitura do conteúdo |
| `src/app/core/services/bag.service.ts` | Sacola (localStorage) e montagem da mensagem do WhatsApp |
| `src/app/core/services/motion.service.ts` | Smooth scroll (Lenis) + GSAP/ScrollTrigger |
| `src/app/app.routes.server.ts` | Lista de slugs pré-renderizados |
| `src/app/shared/directives` | `reveal`, `parallax`, `magnetic`, `tilt` |
| `src/app/shared/ui` | Cursor, header, sacola, preloader, card, ilustração dos produtos... |

## Efeitos

- `reveal="words|fade|clip|scrub"` — entrada ligada ao scroll (`revealOnLoad` para o topo da página).
- `parallax="-10"` — deslocamento vertical no scroll.
- `magnetic="0.3"` — elemento puxado pelo cursor (filho com `data-magnetic-inner` anda mais).
- `data-cursor="Ver"` — o cursor vira um círculo com o texto ao passar por cima.
- Tudo respeita `prefers-reduced-motion`; cursor customizado só aparece com mouse.

## Conteúdo (Prismic)

O conteúdo vem do repositório Prismic `kntukai1` e é baixado **no build** por `scripts/prismic-fetch-content.mjs`, que grava `src/app/core/data/catalog.content.json`. Os scripts `prebuild`, `prestart` e `pretest` rodam isso automaticamente.

| Variável | Para quê |
| --- | --- |
| `PRISMIC_REPO` | Nome do repositório (`kntukai1`). Sem ela, o site usa o `catalog.mock.ts`. |
| `PRISMIC_ACCESS_TOKEN` | Opcional, só se a Content API do repositório for privada. |

- Sem vendedora ou sem produtos publicados no Prismic, o build usa o mock e avisa no log.
- Com `PRISMIC_REPO` definido e a API fora do ar, o build falha, para nunca publicar o mock no lugar do conteúdo real.
- `catalog.content.json` fica versionado como `null`. Não faça commit dele com conteúdo.

### Modelos

Os custom types `seller`, `category` e `product` estão em `prismic/customtypes/`. Para enviar alterações, gere um token em *Settings > API & Security > Write APIs > Custom Types API* e rode:
```bash
PRISMIC_REPO=kntukai1 PRISMIC_WRITE_TOKEN=seu-token npm run prismic:push
```

### Próximos passos

1. Na Vercel: definir `PRISMIC_REPO=kntukai1` e usar `npm run build` como Build Command.
2. Webhook do Prismic → Deploy Hook da Vercel, para publicar quando ela salvar um produto.
