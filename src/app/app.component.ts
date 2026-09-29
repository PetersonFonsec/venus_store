import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MotionService } from './core/services/motion.service';
import { BagDrawerComponent } from './shared/ui/bag-drawer/bag-drawer.component';
import { CursorComponent } from './shared/ui/cursor/cursor.component';
import { FooterComponent } from './shared/ui/footer/footer.component';
import { HeaderComponent } from './shared/ui/header/header.component';
import { PreloaderComponent } from './shared/ui/preloader/preloader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PreloaderComponent, CursorComponent, HeaderComponent, FooterComponent, BagDrawerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => motion.init(destroyRef));
  }
}
