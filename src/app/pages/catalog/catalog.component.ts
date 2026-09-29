import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';

import { CategoryId } from '../../core/models/product.model';
import { CatalogService } from '../../core/services/catalog.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'discount';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RevealDirective, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent {
  protected readonly catalog = inject(CatalogService);

  /** ?promo=1 vindo de links "Ver promoções". */
  readonly promo = input<string>();

  protected readonly category = signal<CategoryId | 'all'>('all');
  protected readonly onlyPromo = linkedSignal(() => this.promo() === '1');
  protected readonly sort = signal<Sort>('featured');

  protected readonly sorts: { id: Sort; label: string }[] = [
    { id: 'featured', label: 'Destaques' },
    { id: 'discount', label: 'Maior desconto' },
    { id: 'price-asc', label: 'Menor preço' },
    { id: 'price-desc', label: 'Maior preço' },
  ];

  protected readonly list = computed(() => {
    const price = (p: { price: number; promoPrice?: number }) => p.promoPrice ?? p.price;
    const items = this.catalog.products.filter(
      (p) => (this.category() === 'all' || p.category === this.category()) && (!this.onlyPromo() || p.promoPrice),
    );
    switch (this.sort()) {
      case 'price-asc':
        return [...items].sort((a, b) => price(a) - price(b));
      case 'price-desc':
        return [...items].sort((a, b) => price(b) - price(a));
      case 'discount':
        return [...items].sort((a, b) => this.catalog.discount(b) - this.catalog.discount(a));
      default:
        return [...items].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
  });

  protected countFor(id: CategoryId | 'all'): number {
    return this.catalog.products.filter((p) => id === 'all' || p.category === id).length;
  }

  protected onSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as Sort);
  }
}
