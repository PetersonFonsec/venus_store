import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-stars',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'img', '[attr.aria-label]': "'Nota ' + value() + ' de 5'" },
  template: `
    @for (i of [1, 2, 3, 4, 5]; track i) {
      <app-icon name="star" [class.off]="i > value()" />
    }
  `,
  styles: [':host{display:inline-flex;gap:2px;color:var(--gold)} .off{opacity:.25}'],
})
export class StarsComponent {
  readonly value = input.required<number>();
}
