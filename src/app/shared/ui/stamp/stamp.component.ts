import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let uid = 0;

/** Selo circular com texto girando — ecoa o carimbo da logo. */
@Component({
  selector: 'app-stamp',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 200 200" class="stamp__ring" aria-hidden="true">
      <defs><path [attr.id]="id" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0" /></defs>
      <!-- textLength = circunferência: qualquer texto fecha o círculo certinho. -->
      <text><textPath [attr.href]="'#' + id" textLength="488" lengthAdjust="spacing">{{ text() }}</textPath></text>
    </svg>
    <div class="stamp__center"><ng-content /></div>
  `,
  styles: [
    `
      :host { position: relative; display: grid; place-items: center; width: var(--size, 160px); aspect-ratio: 1; color: var(--cobalt); }
      .stamp__ring { position: absolute; inset: 0; width: 100%; height: 100%; animation: spin 22s linear infinite; }
      :host(:hover) .stamp__ring { animation-duration: 8s; }
      text { font: 600 13.5px var(--font-body); text-transform: uppercase; fill: currentColor; }
      .stamp__center { position: relative; display: grid; place-items: center; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .stamp__ring { animation: none; } }
    `,
  ],
})
export class StampComponent {
  readonly text = input('Use Vênus • Acessórios e Cosméticos • ');
  protected readonly id = `stamp${uid++}`;
}
