import { RenderMode, ServerRoute } from '@angular/ssr';

import { CATALOG } from './core/data/catalog';

/**
 * Tudo é gerado estaticamente no build (JAMStack).
 * Os slugs vêm do conteúdo baixado do Prismic antes do build.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'produtos/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => CATALOG.products.map((p) => ({ slug: p.slug })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
