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

## Próximos passos (Prismic)

1. Criar os custom types no Prismic. Os modelos `seller`, `category` e `product` estão em `prismic/customtypes/` (formato do Slice Machine). Para enviar, gere um token em *Settings > API & Security > Write APIs > Custom Types API* e rode:
   ```bash
   PRISMIC_REPO=nome-do-repositorio PRISMIC_WRITE_TOKEN=seu-token npm run prismic:push
   ```
   O script cria os tipos que ainda não existem e atualiza os que já existem.
2. Trocar a origem de dados do `CatalogService` e o `getPrerenderParams` para ler a API no build.
3. Webhook do Prismic → Deploy Hook da Vercel, para publicar quando ela salvar um produto.
4. Com fotos reais, preencher `image` no produto — o card e a página já trocam a ilustração pela foto.
