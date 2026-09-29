import { DestroyRef, Directive, ElementRef, NgZone, afterNextRender, inject, input } from '@angular/core';
import { gsap } from 'gsap';

import { MotionService } from '../../core/services/motion.service';

/** O elemento é "puxado" pelo cursor. Filhos com [data-magnetic-inner] andam mais, dando profundidade. */
@Directive({ selector: '[magnetic]', standalone: true })
export class MagneticDirective {
  readonly strength = input(0.35, { alias: 'magnetic', transform: (v: number | string) => (v === '' ? 0.35 : Number(v)) });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);
  private readonly zone = inject(NgZone);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!this.motion.finePointer || this.motion.reduced) return;
      const el = this.el;
      const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      const ixTo = inner && gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'power3.out' });
      const iyTo = inner && gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'power3.out' });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const s = this.strength();
        xTo(dx * s);
        yTo(dy * s);
        ixTo?.(dx * s * 0.5);
        iyTo?.(dy * s * 0.5);
      };
      const leave = () => {
        gsap.to(inner ? [el, inner] : el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
      };

      this.zone.runOutsideAngular(() => {
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
      });
      destroyRef.onDestroy(() => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      });
    });
  }
}
