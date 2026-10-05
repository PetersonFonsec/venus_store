import { Injectable } from '@angular/core';

import { CATALOG } from '../data/catalog';
import { CategoryId, Product } from '../models/product.model';

/**
 * Única porta de entrada para o conteúdo (Prismic no build, ou o mock sem ele).
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly seller = CATALOG.seller;
  readonly categories = CATALOG.categories;
  readonly products = CATALOG.products;

  bySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  promos(): Product[] {
    return this.products.filter((p) => p.promoPrice);
  }

  featured(): Product {
    return this.products.find((p) => p.featured) ?? this.products[0];
  }

  related(product: Product, limit = 4): Product[] {
    const same = this.products.filter((p) => p.slug !== product.slug && p.category === product.category);
    const others = this.products.filter((p) => p.slug !== product.slug && p.category !== product.category);
    return [...same, ...others].slice(0, limit);
  }

  categoryLabel(id: CategoryId): string {
    return this.categories.find((c) => c.id === id)?.label ?? id;
  }

  discount(product: Product): number {
    return product.promoPrice ? Math.round((1 - product.promoPrice / product.price) * 100) : 0;
  }
}
