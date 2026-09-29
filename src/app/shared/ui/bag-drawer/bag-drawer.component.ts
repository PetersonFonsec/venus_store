import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BagService } from '../../../core/services/bag.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { MotionService } from '../../../core/services/motion.service';
import { BrlPipe } from '../../pipes/brl.pipe';
import { IconComponent } from '../icon/icon.component';
import { ProductArtComponent } from '../product-art/product-art.component';

@Component({
  selector: 'app-bag-drawer',
  standalone: true,
  imports: [RouterLink, BrlPipe, IconComponent, ProductArtComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bag-drawer.component.html',
  styleUrl: './bag-drawer.component.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class BagDrawerComponent {
  protected readonly bag = inject(BagService);
  protected readonly seller = inject(CatalogService).seller;
  private readonly motion = inject(MotionService);

  constructor() {
    effect(() => {
      if (!this.motion.isBrowser) return;
      this.bag.open() ? this.motion.lock() : this.motion.unlock();
    });
  }

  protected close(): void {
    this.bag.open.set(false);
  }
}
