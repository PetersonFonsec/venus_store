/**
 * Formato dos dados que o site consome.
 * Mapeia os custom types do Prismic (seller, category, product); a conversão
 * fica em scripts/prismic-fetch-content.mjs.
 */

/** UID do documento `category` no Prismic (perfumaria, corpo-e-banho...). */
export type CategoryId = string;

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
  /** Foto (Prismic). Se ausente, mostra a inicial do nome. */
  photo?: string;
  bio: string[];
  stats: { value: number; suffix?: string; label: string }[];
  values: { title: string; text: string }[];
}

export interface CatalogContent {
  seller: Seller;
  categories: Category[];
  products: Product[];
}
