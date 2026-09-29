import { DestroyRef, Directive, ElementRef, NgZone, afterNextRender, inject, input } from '@angular/core';
import { gsap } from 'gsap';

import { MotionService } from '../../core/services/motion.service';

/** Inclinação 3D leve seguindo o cursor. */
@Directive({ selector: '[tilt]', standalone: true })
export class TiltDirective {
  readonly max = input(8, { alias: 'tilt', transform: (v: number | string) => (v === '' ? 8 : Number(v)) });

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(MotionService);
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!motion.finePointer || motion.reduced) return;
      gsap.set(el, { transformPerspective: 900 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx(-py * this.max());
        ry(px * this.max());
      };
      const leave = () => {
        rx(0);
        ry(0);
      };
      zone.runOutsideAngular(() => {
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
