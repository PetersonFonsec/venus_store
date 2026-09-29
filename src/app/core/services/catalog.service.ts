import { Injectable } from '@angular/core';

import { CATEGORIES, PRODUCTS, SELLER } from '../data/catalog.mock';
import { CategoryId, Product } from '../models/product.model';

/**
 * Única porta de entrada para o conteúdo.
 * Hoje lê o mock; depois, os mesmos métodos passam a ler o Prismic no build.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly seller = SELLER;
  readonly categories = CATEGORIES;
  readonly products = PRODUCTS;

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
