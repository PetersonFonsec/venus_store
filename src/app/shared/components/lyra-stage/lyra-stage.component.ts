import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { LyraScene } from '../../three/lyra-scene';

/**
 * WebGL stage for the procedural Lyra bottle.
 * three.js is imported lazily in the browser only, so SSR/prerender never touches WebGL.
 */
@Component({
  selector: 'app-lyra-stage',
  standalone: true,
  templateUrl: './lyra-stage.component.html',
  styleUrl: './lyra-stage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-ready]': 'ready()',
    '[class.is-fallback]': 'fallback()',
  },
})
export class LyraStageComponent {
  /** Scroll story progress (0..1) that drives camera and exploded view. */
  readonly progress = input(0);

  readonly ready = signal(false);
  readonly fallback = signal(false);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private scene: LyraScene | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const cleanups: (() => void)[] = [];
    let destroyed = false;
    destroyRef.onDestroy(() => {
      destroyed = true;
      cleanups.forEach((cleanup) => cleanup());
      this.scene?.dispose();
      this.scene = null;
    });

    effect(() => {
      const value = this.progress();
      this.scene?.setProgress(value);
    });

    afterNextRender(async () => {
      const canvas = this.canvas().nativeElement;
      if (!this.supportsWebGL()) {
        this.fallback.set(true);
        return;
      }
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const { createLyraScene } = await import('../../three/lyra-scene');
      if (destroyed) return;

      const scene = createLyraScene(canvas, { transparent: true, reducedMotion });
      this.scene = scene;
      scene.setProgress(this.progress());

      const element = this.host.nativeElement;
      const resize = () => scene.resize(element.clientWidth, element.clientHeight);
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(element);
      resize();

      // Render only while visible, and never in a background tab.
      let visible = true;
      const sync = () => scene.setActive(visible && document.visibilityState === 'visible');
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      });
      intersection.observe(element);
      document.addEventListener('visibilitychange', sync);

      // Pointer parallax (fine pointers) and drag-to-spin with inertia.
      let dragging = false;
      let lastX = 0;
      const onMove = (event: PointerEvent) => {
        if (dragging) {
          scene.dragBy(event.clientX - lastX);
          lastX = event.clientX;
          return;
        }
        if (event.pointerType !== 'mouse') return;
        const rect = element.getBoundingClientRect();
        scene.setPointer(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          ((event.clientY - rect.top) / rect.height) * 2 - 1,
        );
      };
      const onDown = (event: PointerEvent) => {
        dragging = true;
        lastX = event.clientX;
        canvas.setPointerCapture(event.pointerId);
      };
      const onUp = () => (dragging = false);
      const onLeave = () => scene.setPointer(0, 0);
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerup', onUp);
      element.addEventListener('pointerleave', onLeave);

      cleanups.push(() => {
        resizeObserver.disconnect();
        intersection.disconnect();
        document.removeEventListener('visibilitychange', sync);
        canvas.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        element.removeEventListener('pointerleave', onLeave);
      });

      requestAnimationFrame(() => this.ready.set(true));
    });
  }

  private supportsWebGL(): boolean {
    try {
      const probe = document.createElement('canvas');
      return !!(probe.getContext('webgl2') || probe.getContext('webgl'));
    } catch {
      return false;
    }
  }
}
