import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject, input, viewChild } from '@angular/core';
import { gsap } from 'gsap';

import { MotionService } from '../../../core/services/motion.service';

/**
 * Faixa de texto infinita. Acelera e inverte o sentido conforme o scroll.
 */
@Component({
  selector: 'app-marquee',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="marquee__track" #track>
      @for (copy of [0, 1]; track copy) {
        <div class="marquee__group" [attr.aria-hidden]="copy === 1">
          @for (item of items(); track $index) {
            <span class="marquee__item">{{ item }}</span>
            <span class="marquee__sep" aria-hidden="true">✿</span>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; overflow: hidden; white-space: nowrap; }
      .marquee__track { display: flex; width: max-content; will-change: transform; }
      .marquee__group { display: flex; align-items: center; flex: none; }
      .marquee__item { padding-inline: 0.5em; }
      .marquee__sep { font-size: 0.45em; padding-inline: 0.6em; color: var(--sep-color, currentColor); }
    `,
  ],
})
export class MarqueeComponent {
  readonly items = input.required<string[]>();
  /** Segundos para percorrer uma cópia. */
  readonly duration = input(28);
  readonly reverse = input(false);

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  constructor() {
    const motion = inject(MotionService);
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (motion.reduced) return;
      const el = this.track().nativeElement;
      let x = 0;
      let dir = this.reverse() ? 1 : -1;

      const tick = (_t: number, delta: number) => {
        const v = motion.velocity;
        if (Math.abs(v) > 0.5) dir = (v > 0 ? -1 : 1) * (this.reverse() ? -1 : 1);
        const speed = (50 / this.duration()) * (1 + Math.min(Math.abs(v) * 0.35, 6));
        x += dir * speed * (delta / 1000);
        // Loop entre -50% e 0% (são duas cópias idênticas).
        if (x <= -50) x += 50;
        if (x > 0) x -= 50;
        gsap.set(el, { xPercent: x });
      };

      zone.runOutsideAngular(() => gsap.ticker.add(tick));
      destroyRef.onDestroy(() => gsap.ticker.remove(tick));
    });
  }
}
