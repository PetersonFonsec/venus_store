import { RenderMode, ServerRoute } from '@angular/ssr';

import { PRODUCTS } from './core/data/catalog.mock';

/**
 * Tudo é gerado estaticamente no build (JAMStack).
 * Com o Prismic, getPrerenderParams passa a buscar os slugs na API.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'produtos/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PRODUCTS.map((p) => ({ slug: p.slug })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
