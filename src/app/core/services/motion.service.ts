import { DestroyRef, Injectable, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * Orquestra tudo que é movimento: smooth scroll (Lenis) + GSAP/ScrollTrigger.
 * Só roda no browser; no prerender vira no-op.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly zone = inject(NgZone);
  private readonly router = inject(Router);
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  lenis?: Lenis;
  /** Velocidade atual do scroll, lida pelo marquee. */
  velocity = 0;
  reduced = false;
  finePointer = false;

  private resolveReady!: () => void;
  /** Resolve quando o preloader termina — animações de entrada esperam por isso. */
  readonly ready = new Promise<void>((resolve) => (this.resolveReady = resolve));

  constructor() {
    // Feito na criação do serviço: componentes filhos rodam afterNextRender antes do init() do AppComponent.
    if (!this.isBrowser) return;
    gsap.registerPlugin(ScrollTrigger);
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.finePointer = matchMedia('(pointer: fine)').matches;
  }

  init(destroyRef: DestroyRef): void {
    if (!this.isBrowser) return;

    this.zone.runOutsideAngular(() => {
      if (!this.reduced) {
        this.lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
        this.lenis.on('scroll', (e: Lenis) => {
          this.velocity = e.velocity;
          ScrollTrigger.update();
        });
        const tick = (time: number) => this.lenis?.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        destroyRef.onDestroy(() => gsap.ticker.remove(tick));
      }
    });

    const sub = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.lenis?.scrollTo(0, { immediate: true, force: true });
      // Espera o novo componente pintar antes de recalcular os gatilhos.
      requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    });
    destroyRef.onDestroy(() => {
      sub.unsubscribe();
      this.lenis?.destroy();
    });

    // Imagens e fontes mudam alturas; recalcula depois que tudo carregou.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }

  markReady(): void {
    this.resolveReady();
  }

  lock(): void {
    this.lenis?.stop();
    document.documentElement.classList.add('is-locked');
  }

  unlock(): void {
    this.lenis?.start();
    document.documentElement.classList.remove('is-locked');
  }

  scrollTo(target: string | HTMLElement | number): void {
    if (this.lenis) this.lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    else if (typeof target === 'number') scrollTo({ top: target });
    else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView();
  }
}
