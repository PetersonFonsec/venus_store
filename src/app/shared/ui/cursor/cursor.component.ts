import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject, viewChild } from '@angular/core';
import { gsap } from 'gsap';

import { MotionService } from '../../../core/services/motion.service';

/**
 * Cursor customizado: um ponto preciso + um anel que segue com atraso.
 * - Em links/botões o anel cresce.
 * - Em elementos com [data-cursor="Texto"] vira um círculo cobalto com o texto.
 * Some automaticamente em telas touch.
 */
@Component({
  selector: 'app-cursor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cursor.component.html',
  styleUrl: './cursor.component.scss',
})
export class CursorComponent {
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly dot = viewChild.required<ElementRef<HTMLElement>>('dot');
  private readonly ring = viewChild.required<ElementRef<HTMLElement>>('ring');
  private readonly label = viewChild.required<ElementRef<HTMLElement>>('label');

  constructor() {
    const motion = inject(MotionService);
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!motion.finePointer) return;
      const root = this.root().nativeElement;
      const label = this.label().nativeElement;
      document.documentElement.classList.add('has-cursor');

      const dx = gsap.quickTo(this.dot().nativeElement, 'x', { duration: 0.12, ease: 'power3.out' });
      const dy = gsap.quickTo(this.dot().nativeElement, 'y', { duration: 0.12, ease: 'power3.out' });
      const rx = gsap.quickTo(this.ring().nativeElement, 'x', { duration: 0.55, ease: 'power3.out' });
      const ry = gsap.quickTo(this.ring().nativeElement, 'y', { duration: 0.55, ease: 'power3.out' });

      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        root.classList.add('is-visible');
        dx(e.clientX);
        dy(e.clientY);
        rx(e.clientX);
        ry(e.clientY);
      };

      const over = (e: Event) => {
        const target = e.target as Element | null;
        const labelled = target?.closest<HTMLElement>('[data-cursor]');
        const interactive = target?.closest('a, button, [role="button"], input, select, textarea, label');
        root.classList.toggle('is-label', !!labelled);
        root.classList.toggle('is-hover', !labelled && !!interactive);
        if (labelled) label.textContent = labelled.dataset['cursor'] ?? '';
      };

      const down = () => root.classList.add('is-down');
      const up = () => root.classList.remove('is-down');
      const hide = () => root.classList.remove('is-visible');

      zone.runOutsideAngular(() => {
        addEventListener('pointermove', move, { passive: true });
        document.addEventListener('pointerover', over, { passive: true });
        addEventListener('pointerdown', down);
        addEventListener('pointerup', up);
        document.documentElement.addEventListener('pointerleave', hide);
      });

      destroyRef.onDestroy(() => {
        removeEventListener('pointermove', move);
        document.removeEventListener('pointerover', over);
        removeEventListener('pointerdown', down);
        removeEventListener('pointerup', up);
        document.documentElement.removeEventListener('pointerleave', hide);
        document.documentElement.classList.remove('has-cursor');
      });
    });
  }
}
