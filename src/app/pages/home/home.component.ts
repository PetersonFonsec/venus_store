import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';

import { CategoryId } from '../../core/models/product.model';
import { BagService } from '../../core/services/bag.service';
import { CatalogService } from '../../core/services/catalog.service';
import { MotionService } from '../../core/services/motion.service';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { ParallaxDirective } from '../../shared/directives/parallax.directive';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { BrlPipe } from '../../shared/pipes/brl.pipe';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { MarqueeComponent } from '../../shared/ui/marquee/marquee.component';
import { ProductArtComponent } from '../../shared/ui/product-art/product-art.component';
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';
import { StampComponent } from '../../shared/ui/stamp/stamp.component';
import { StarsComponent } from '../../shared/ui/stars/stars.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    BrlPipe,
    MagneticDirective,
    ParallaxDirective,
    RevealDirective,
    IconComponent,
    MarqueeComponent,
    ProductArtComponent,
    ProductCardComponent,
    StampComponent,
    StarsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly catalog = inject(CatalogService);
  protected readonly bag = inject(BagService);
  private readonly motion = inject(MotionService);

  protected readonly seller = this.catalog.seller;
  protected readonly promos = this.catalog.promos();
  protected readonly featured = this.catalog.featured();
  protected readonly heroArts = [this.catalog.bySlug('lily-eau-de-parfum')!, this.catalog.bySlug('floratta-blue')!, this.catalog.bySlug('botik-vitamina-c')!];

  protected readonly filter = signal<CategoryId | 'all'>('all');
  protected readonly shelf = computed(() => {
    const f = this.filter();
    return this.catalog.products.filter((p) => f === 'all' || p.category === f).slice(0, 6);
  });

  protected readonly marquee = ['Promoções da semana', 'Pedido pelo WhatsApp', 'Opinião sincera', 'Entrega em São Paulo', 'Embalado para presente'];

  protected readonly steps = [
    { title: 'Escolha', text: 'Navegue pelos produtos, leia minha opinião e veja o que combina com você.' },
    { title: 'Monte a sacola', text: 'Adicione o que quiser. Nada de cadastro, cartão ou senha.' },
    { title: 'Finalize comigo', text: 'A sacola vira uma mensagem no WhatsApp. Eu confirmo tudo e combino a entrega.' },
  ];

  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private readonly promo = viewChild.required<ElementRef<HTMLElement>>('promo');
  private readonly promoTrack = viewChild.required<ElementRef<HTMLElement>>('promoTrack');
  private readonly stepsLine = viewChild.required<ElementRef<HTMLElement>>('stepsLine');

  constructor() {
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(async () => {
      await this.motion.ready;
      if (this.motion.reduced) return;

      const hero = this.hero().nativeElement;
      const mm = gsap.matchMedia();

      const ctx = gsap.context(() => {
        // Produtos do hero entram girando e depois seguem o mouse em camadas.
        gsap.from('.hero__float', { yPercent: 60, rotate: (i) => [-18, 14, -10][i], autoAlpha: 0, duration: 1.8, ease: 'expo.out', stagger: 0.12, delay: 0.3 });
        gsap.from('.hero__foot > *', { y: 30, autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.7 });
        gsap.to('.hero__content', {
          yPercent: 18,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
        });

        // Promoções: rolagem horizontal presa na tela (só desktop).
        mm.add('(min-width: 900px)', () => {
          const track = this.promoTrack().nativeElement;
          const distance = () => track.scrollWidth - innerWidth + 80;
          gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: this.promo().nativeElement,
              start: 'top top',
              end: () => '+=' + distance(),
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });
        });

        gsap.fromTo(this.stepsLine().nativeElement, { scaleX: 0 }, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: this.stepsLine().nativeElement, start: 'top 85%', end: 'top 35%', scrub: true },
        });
      }, hero.parentElement!);

      if (this.motion.finePointer) {
        const layers = Array.from(hero.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
          x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
          depth: Number(el.dataset['depth']),
        }));
        const move = (e: PointerEvent) => {
          const nx = e.clientX / innerWidth - 0.5;
          const ny = e.clientY / innerHeight - 0.5;
          layers.forEach((l) => {
            l.x(nx * l.depth * 60);
            l.y(ny * l.depth * 40);
          });
        };
        zone.runOutsideAngular(() => hero.addEventListener('pointermove', move));
        destroyRef.onDestroy(() => hero.removeEventListener('pointermove', move));
      }

      destroyRef.onDestroy(() => {
        ctx.revert();
        mm.revert();
      });
    });
  }

  protected scrollTo(target: string): void {
    this.motion.scrollTo(target);
  }
}
