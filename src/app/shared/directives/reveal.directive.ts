import { DestroyRef, Directive, ElementRef, afterNextRender, computed, inject, input } from '@angular/core';
import { gsap } from 'gsap';

import { MotionService } from '../../core/services/motion.service';
import { splitWords } from './split-text';

export type RevealMode = 'fade' | 'words' | 'clip' | 'scrub' | '';

/**
 * Animação de entrada ligada ao scroll.
 *  - fade:  sobe e aparece
 *  - words: cada palavra sobe de dentro de uma máscara
 *  - clip:  a imagem "abre" de baixo pra cima
 *  - scrub: palavras acendem conforme o scroll (sem estado escondido)
 */
@Directive({
  selector: '[reveal]',
  standalone: true,
  host: { '[attr.data-reveal]': 'resolved()' },
})
export class RevealDirective {
  readonly mode = input<RevealMode>('', { alias: 'reveal' });
  readonly delay = input(0, { alias: 'revealDelay' });
  /** Em vez de esperar o scroll, anima assim que a página fica pronta (hero). */
  readonly onLoad = input(false, { alias: 'revealOnLoad' });

  protected readonly resolved = computed(() => this.mode() || 'fade');

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);
  private ctx?: gsap.Context;

  constructor() {
    afterNextRender(() => this.setup());
    inject(DestroyRef).onDestroy(() => this.ctx?.revert());
  }

  private async setup(): Promise<void> {
    await this.motion.ready;
    const el = this.el;
    const mode = this.resolved();

    if (this.motion.reduced) {
      gsap.set(el, { autoAlpha: 1 });
      return;
    }

    this.ctx = gsap.context(() => {
      const trigger = this.onLoad() ? undefined : { trigger: el, start: 'top 88%', once: true };
      const delay = this.delay() + (this.onLoad() ? 0.1 : 0);

      switch (mode) {
        case 'words': {
          const words = splitWords(el);
          gsap.set(el, { autoAlpha: 1 });
          gsap.from(words, { yPercent: 115, rotate: 6, duration: 1.2, ease: 'expo.out', stagger: 0.045, delay, scrollTrigger: trigger });
          break;
        }
        case 'clip': {
          const img = el.querySelector('img, svg');
          const tl = gsap.timeline({ delay, scrollTrigger: trigger });
          tl.fromTo(el, { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' });
          if (img) tl.from(img, { scale: 1.25, duration: 1.8, ease: 'expo.out' }, 0.2);
          break;
        }
        case 'scrub': {
          const words = splitWords(el);
          gsap.fromTo(words, { opacity: 0.14 }, {
            opacity: 1,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: true },
          });
          break;
        }
        default:
          gsap.fromTo(el, { autoAlpha: 0, y: 48 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: 'expo.out', delay, scrollTrigger: trigger });
      }
    }, el);
  }
}
