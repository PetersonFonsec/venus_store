import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';

import { CatalogService } from '../../../core/services/catalog.service';
import { MotionService } from '../../../core/services/motion.service';
import { MagneticDirective } from '../../directives/magnetic.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MagneticDirective, RevealDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly seller = inject(CatalogService).seller;
  protected readonly year = new Date().getFullYear();
  protected readonly time = signal('');
  protected readonly waLink = `https://wa.me/${this.seller.whatsapp}?text=${encodeURIComponent(`Oi, ${this.seller.name}! Vim pelo site da Use Vênus.`)}`;

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly inner = viewChild.required<ElementRef<HTMLElement>>('inner');

  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const fmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
      const update = () => this.time.set(fmt.format(new Date()));
      update();
      const clock = setInterval(update, 15_000);
      destroyRef.onDestroy(() => clearInterval(clock));

      if (motion.reduced) return;
      // O conteúdo do rodapé "sobe de baixo" da página, como se estivesse por trás dela.
      const ctx = gsap.context(() => {
        gsap.fromTo(this.inner().nativeElement, { yPercent: -35 }, {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: this.root().nativeElement, start: 'top bottom', end: 'bottom bottom', scrub: true },
        });
      });
      destroyRef.onDestroy(() => ctx.revert());
    });
  }
}
