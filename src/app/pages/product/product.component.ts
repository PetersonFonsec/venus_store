import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { BagService } from '../../core/services/bag.service';
import { CatalogService } from '../../core/services/catalog.service';
import { MotionService } from '../../core/services/motion.service';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { BrlPipe } from '../../shared/pipes/brl.pipe';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { ProductArtComponent } from '../../shared/ui/product-art/product-art.component';
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';
import { StampComponent } from '../../shared/ui/stamp/stamp.component';
import { StarsComponent } from '../../shared/ui/stars/stars.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    RouterLink,
    BrlPipe,
    MagneticDirective,
    RevealDirective,
    IconComponent,
    ProductArtComponent,
    ProductCardComponent,
    StampComponent,
    StarsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent {
  readonly slug = input.required<string>();

  protected readonly catalog = inject(CatalogService);
  protected readonly bag = inject(BagService);
  protected readonly motion = inject(MotionService);
  protected readonly seller = this.catalog.seller;

  protected readonly product = computed(() => this.catalog.bySlug(this.slug()));
  /** Lista de 0/1 item: força recriar a página (e as animações) ao trocar de produto. */
  protected readonly current = computed(() => (this.product() ? [this.product()!] : []));
  protected readonly related = computed(() => (this.product() ? this.catalog.related(this.product()!) : []));
  protected readonly qty = linkedSignal({ source: this.slug, computation: () => 1 });

  constructor() {
    const title = inject(Title);
    const meta = inject(Meta);
    effect(() => {
      const p = this.product();
      if (!p) return;
      title.setTitle(`${p.name} · Use Vênus`);
      meta.updateTag({ name: 'description', content: `${p.review.text.slice(0, 150)}…` });
      meta.updateTag({ property: 'og:title', content: `${p.name} · Use Vênus` });
    });
  }

  protected step(delta: number): void {
    const p = this.product();
    if (!p) return;
    this.qty.update((q) => Math.min(Math.max(q + delta, 1), p.stock));
  }
}
