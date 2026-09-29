import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product } from '../../../core/models/product.model';
import { BagService } from '../../../core/services/bag.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { TiltDirective } from '../../directives/tilt.directive';
import { BrlPipe } from '../../pipes/brl.pipe';
import { IconComponent } from '../icon/icon.component';
import { ProductArtComponent } from '../product-art/product-art.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, BrlPipe, IconComponent, ProductArtComponent, TiltDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  readonly product = input.required<Product>();

  protected readonly bag = inject(BagService);
  private readonly catalog = inject(CatalogService);

  protected readonly discount = computed(() => this.catalog.discount(this.product()));
  protected readonly category = computed(() => this.catalog.categoryLabel(this.product().category));
  protected readonly quote = computed(() => {
    const text = this.product().review.text;
    const first = text.split(/(?<=[.!?])\s/)[0];
    return first.length > 110 ? first.slice(0, 107).trimEnd() + '…' : first;
  });

  protected add(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.bag.add(this.product());
  }
}
