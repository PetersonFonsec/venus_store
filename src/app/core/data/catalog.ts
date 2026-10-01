import { CatalogContent } from '../models/product.model';
import content from './catalog.content.json';
import { CATEGORIES, PRODUCTS, SELLER } from './catalog.mock';

/**
 * Conteúdo do site. catalog.content.json é gerado antes do build/serve por
 * scripts/prismic-fetch-content.mjs; quando ele vem `null` (sem Prismic), usa o mock.
 */
export const CATALOG: CatalogContent = (content as unknown as CatalogContent | null) ?? {
  seller: SELLER,
  categories: CATEGORIES,
  products: PRODUCTS,
};
