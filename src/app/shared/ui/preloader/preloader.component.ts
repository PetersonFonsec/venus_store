import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { gsap } from 'gsap';

import { MotionService } from '../../../core/services/motion.service';

/**
 * Tela de entrada: contador 0→100 e o nome surgindo; depois uma cortina sobe.
 * Vem no HTML pré-renderizado, então cobre a página desde o primeiro paint.
 */
@Component({
  selector: 'app-preloader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './preloader.component.html',
  styleUrl: './preloader.component.scss',
})
export class PreloaderComponent {
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  protected readonly done = signal(false);

  constructor() {
    const motion = inject(MotionService);

    afterNextRender(() => {
      const root = this.root().nativeElement;
      const finish = () => {
        this.done.set(true);
        motion.markReady();
      };

      if (motion.reduced) {
        gsap.to(root, { autoAlpha: 0, duration: 0.3, onComplete: finish });
        return;
      }

      const counter = { v: 0 };
      const num = root.querySelector('.preloader__count')!;
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from('.preloader__word .w__i', { yPercent: 110, duration: 1.1, stagger: 0.08 }, 0)
        .from('.preloader__line', { scaleX: 0, duration: 1.4, ease: 'expo.inOut' }, 0)
        .to(counter, {
          v: 100,
          duration: 1.4,
          ease: 'power2.inOut',
          onUpdate: () => (num.textContent = String(Math.round(counter.v)).padStart(3, '0')),
        }, 0)
        .to('.preloader__word .w__i', { yPercent: -110, duration: 0.7, stagger: 0.05, ease: 'expo.in' }, 1.5)
        .add(() => motion.markReady(), 1.9)
        .to(root, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, 1.9)
        .add(finish);
    });
  }
}
