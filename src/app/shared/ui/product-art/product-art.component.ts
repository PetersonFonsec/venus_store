import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ArtKind, ArtTone } from '../../../core/models/product.model';

interface Palette {
  bg: string;
  bg2: string;
  liquid: string;
  cap: string;
  ink: string;
  /** Cor escura para texto sobre o rótulo claro do frasco com válvula. */
  deep: string;
}

const PALETTES: Record<ArtTone, Palette> = {
  cobalt: { bg: '#DCE7F8', bg2: '#C3D6F4', liquid: '#2F6FDB', cap: '#0B1B3A', ink: '#FFFFFF', deep: '#0B1B3A' },
  rose: { bg: '#F2E2DA', bg2: '#EACFC4', liquid: '#E3A195', cap: '#C9A46A', ink: '#7A3B33', deep: '#7A3B33' },
  amber: { bg: '#F0E4CF', bg2: '#E6D2AF', liquid: '#C4843A', cap: '#2A1E17', ink: '#FFF7EA', deep: '#5A3A14' },
  sage: { bg: '#E1E7DB', bg2: '#CFDAC6', liquid: '#9BB38D', cap: '#F7F4EE', ink: '#33472B', deep: '#33472B' },
  plum: { bg: '#E8DCE5', bg2: '#D9C3D3', liquid: '#6E3558', cap: '#C9A46A', ink: '#FBEAF4', deep: '#6E3558' },
  ink: { bg: '#D9DDE6', bg2: '#C4CAD8', liquid: '#1D2537', cap: '#C9A46A', ink: '#E9D6A8', deep: '#1D2537' },
  sand: { bg: '#EFE8DD', bg2: '#E4D8C6', liquid: '#E7D0AE', cap: '#FFFFFF', ink: '#6B5433', deep: '#6B5433' },
};

let uid = 0;

/**
 * Ilustração vetorial do produto (placeholder elegante até termos as fotos).
 * Troque por <img> quando o Prismic tiver a imagem.
 */
@Component({
  selector: 'app-product-art',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-art.component.html',
  styles: [
    `
      :host { display: block; line-height: 0; }
      svg { width: 100%; height: auto; overflow: visible; }
      .art-label { font: 500 13px/1 var(--font-display); letter-spacing: 0.22em; }
      .art-label--small { font-size: 9px; letter-spacing: 0.16em; }
    `,
  ],
})
export class ProductArtComponent {
  readonly kind = input.required<ArtKind>();
  readonly tone = input.required<ArtTone>();
  readonly label = input('');
  /** Sem o arco de fundo — para itens flutuando no hero. */
  readonly bare = input(false);

  protected readonly id = `art${uid++}`;
  protected readonly p = computed(() => PALETTES[this.tone()]);
  protected readonly text = computed(() => this.label().toUpperCase());
}
