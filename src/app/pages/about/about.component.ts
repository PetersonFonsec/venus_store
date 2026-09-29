import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';

import { Product } from '../../core/models/product.model';
import { CatalogService } from '../../core/services/catalog.service';
import { MotionService } from '../../core/services/motion.service';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { ParallaxDirective } from '../../shared/directives/parallax.directive';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { ProductArtComponent } from '../../shared/ui/product-art/product-art.component';
import { StampComponent } from '../../shared/ui/stamp/stamp.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, MagneticDirective, ParallaxDirective, RevealDirective, IconComponent, ProductArtComponent, StampComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  protected readonly catalog = inject(CatalogService);
  protected readonly seller = this.catalog.seller;
  protected readonly favorites = this.catalog.products.filter((p) => p.review.rating === 5);
  protected readonly waLink = `https://wa.me/${this.seller.whatsapp}?text=${encodeURIComponent(`Oi, ${this.seller.name}! Vim pelo site e queria uma indicação.`)}`;

  /** Produto sob o cursor na lista de favoritos — alimenta o preview flutuante. */
  protected readonly hovered = signal<Product | null>(null);

  private readonly stats = viewChild.required<ElementRef<HTMLElement>>('stats');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  private readonly preview = viewChild.required<ElementRef<HTMLElement>>('preview');

  constructor() {
    const motion = inject(MotionService);
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(async () => {
      await motion.ready;

      // Números contam de 0 até o valor quando entram na tela.
      const ctx = gsap.context(() => {
        this.stats()
          .nativeElement.querySelectorAll<HTMLElement>('[data-count]')
          .forEach((el) => {
            const target = Number(el.dataset['count']);
            if (motion.reduced) return void (el.textContent = target.toLocaleString('pt-BR'));
            const obj = { v: 0 };
            gsap.to(obj, {
              v: target,
              duration: 2.2,
              ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
              onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString('pt-BR')),
            });
          });
      });
      destroyRef.onDestroy(() => ctx.revert());

      // Preview que segue o cursor sobre a lista de favoritos.
      if (!motion.finePointer) return;
      const list = this.list().nativeElement;
      const preview = this.preview().nativeElement;
      const xTo = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3.out' });
      const yTo = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3.out' });
      const rTo = gsap.quickTo(preview, 'rotation', { duration: 0.9, ease: 'power3.out' });
      let lastX = 0;
      const move = (e: PointerEvent) => {
        const r = list.getBoundingClientRect();
        xTo(e.clientX - r.left);
        yTo(e.clientY - r.top);
        rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.8));
        lastX = e.clientX;
      };
      zone.runOutsideAngular(() => list.addEventListener('pointermove', move));
      destroyRef.onDestroy(() => list.removeEventListener('pointermove', move));
    });
  }
}
