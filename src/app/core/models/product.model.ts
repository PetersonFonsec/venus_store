/**
 * Formato dos dados que o site consome.
 * Pensado para mapear 1:1 com os custom types do Prismic (product, seller)
 * — quando o CMS entrar, basta trocar a origem no CatalogService.
 */

export type CategoryId = 'perfumaria' | 'corpo-e-banho' | 'skincare' | 'maquiagem';

export interface Category {
  id: CategoryId;
  label: string;
}

/** Ilustração usada enquanto não há foto real do produto. */
export type ArtKind = 'perfume' | 'colonia' | 'lotion' | 'cream' | 'serum' | 'lipstick';
export type ArtTone = 'cobalt' | 'rose' | 'amber' | 'sage' | 'plum' | 'ink' | 'sand';

export interface ProductReview {
  /** Texto em primeira pessoa: o que ela acha do produto. */
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Ex.: "Dias quentes", "Presente de aniversário". */
  bestFor: string;
  highlights: string[];
  /** Observação curta, tipo dica de uso ou alerta. */
  tip?: string;
}

export interface OlfactoryNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface Product {
  slug: string;
  name: string;
  /** Linha / marca dentro do Boticário (Lily, Malbec, Nativa SPA...). */
  line: string;
  category: CategoryId;
  size: string;
  price: number;
  promoPrice?: number;
  stock: number;
  description: string;
  howToUse: string;
  notes?: OlfactoryNotes;
  review: ProductReview;
  featured?: boolean;
  /** URL de foto (Prismic). Se ausente, usa a ilustração. */
  image?: string;
  art: { kind: ArtKind; tone: ArtTone };
}

export interface Seller {
  name: string;
  role: string;
  city: string;
  whatsapp: string;
  instagram: string;
  since: number;
  bio: string[];
  stats: { value: number; suffix?: string; label: string }[];
  values: { title: string; text: string }[];
}
