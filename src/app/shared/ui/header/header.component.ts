import { ChangeDetectionStrategy, Component, DestroyRef, NgZone, afterNextRender, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { BagService } from '../../../core/services/bag.service';
import { MotionService } from '../../../core/services/motion.service';
import { MagneticDirective } from '../../directives/magnetic.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly bag = inject(BagService);
  private readonly motion = inject(MotionService);

  protected readonly links = [
    { path: '/', label: 'Início', exact: true },
    { path: '/produtos', label: 'Produtos', exact: false },
    { path: '/sobre', label: 'Sobre mim', exact: false },
  ];

  protected readonly hidden = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly pulse = signal(false);

  constructor() {
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      let last = scrollY;
      const onScroll = () => {
        const y = scrollY;
        const hidden = y > 240 && y > last && !this.menuOpen();
        const scrolled = y > 24;
        last = y;
        if (hidden !== this.hidden() || scrolled !== this.scrolled()) {
          zone.run(() => {
            this.hidden.set(hidden);
            this.scrolled.set(scrolled);
          });
        }
      };
      zone.runOutsideAngular(() => addEventListener('scroll', onScroll, { passive: true }));
      destroyRef.onDestroy(() => removeEventListener('scroll', onScroll));
    });

    // Fecha o menu mobile ao navegar.
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.setMenu(false));

    // Pulsa o botão da sacola sempre que algo é adicionado.
    let first = true;
    effect(() => {
      this.bag.bump();
      if (first) return void (first = false);
      this.pulse.set(false);
      requestAnimationFrame(() => this.pulse.set(true));
      this.hidden.set(false);
    });
  }

  protected setMenu(open: boolean): void {
    this.menuOpen.set(open);
    if (!this.motion.isBrowser) return;
    open ? this.motion.lock() : this.motion.unlock();
  }
}
