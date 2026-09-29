import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { gsap } from 'gsap';

import { MotionService } from '../../core/services/motion.service';

/** Desloca o elemento no eixo Y conforme o scroll. Valores negativos sobem mais rápido. */
@Directive({ selector: '[parallax]', standalone: true })
export class ParallaxDirective {
  readonly speed = input(-12, { alias: 'parallax', transform: (v: number | string) => (v === '' ? -12 : Number(v)) });

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(MotionService);
    let ctx: gsap.Context | undefined;

    afterNextRender(() => {
      if (motion.reduced) return;
      ctx = gsap.context(() => {
        gsap.fromTo(el, { yPercent: -this.speed() }, {
          yPercent: this.speed(),
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    });
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
