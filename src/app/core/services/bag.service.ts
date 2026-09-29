import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { CatalogService } from './catalog.service';
import { Product } from '../models/product.model';
import { formatBRL } from '../../shared/pipes/brl.pipe';

interface BagLine {
  slug: string;
  qty: number;
}

const STORAGE_KEY = 'venus:bag';

/** Sacola local: não é checkout, só monta a mensagem do WhatsApp. */
@Injectable({ providedIn: 'root' })
export class BagService {
  private readonly catalog = inject(CatalogService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly lines = signal<BagLine[]>([]);

  readonly open = signal(false);
  /** Incrementa a cada adição — usado para o "pulse" do botão da sacola. */
  readonly bump = signal(0);

  readonly items = computed(() =>
    this.lines()
      .map((line) => ({ ...line, product: this.catalog.bySlug(line.slug) }))
      .filter((line): line is BagLine & { product: Product } => !!line.product),
  );

  readonly count = computed(() => this.items().reduce((sum, i) => sum + i.qty, 0));
  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + (i.product.promoPrice ?? i.product.price) * i.qty, 0),
  );

  constructor() {
    if (!this.isBrowser) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (Array.isArray(saved)) this.lines.set(saved);
    } catch {
      /* storage indisponível: segue com sacola vazia */
    }
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lines()));
      } catch {
        /* ignore */
      }
    });
  }

  add(product: Product, qty = 1): void {
    this.lines.update((lines) => {
      const current = lines.find((l) => l.slug === product.slug);
      const next = Math.min((current?.qty ?? 0) + qty, product.stock);
      return current
        ? lines.map((l) => (l.slug === product.slug ? { ...l, qty: next } : l))
        : [...lines, { slug: product.slug, qty: Math.min(qty, product.stock) }];
    });
    this.bump.update((n) => n + 1);
  }

  setQty(slug: string, qty: number): void {
    if (qty <= 0) return this.remove(slug);
    const stock = this.catalog.bySlug(slug)?.stock ?? qty;
    this.lines.update((lines) => lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(qty, stock) } : l)));
  }

  remove(slug: string): void {
    this.lines.update((lines) => lines.filter((l) => l.slug !== slug));
  }

  clear(): void {
    this.lines.set([]);
  }

  whatsappLink(products = this.items()): string {
    const { name, whatsapp } = this.catalog.seller;
    const body = products
      .map((i) => `• ${i.qty}x ${i.product.name} (${i.product.size}) — ${formatBRL((i.product.promoPrice ?? i.product.price) * i.qty)}`)
      .join('\n');
    const total = products.reduce((s, i) => s + (i.product.promoPrice ?? i.product.price) * i.qty, 0);
    const text = `Oi, ${name}! Vim pelo site da Use Vênus e gostaria de pedir:\n\n${body}\n\nTotal: ${formatBRL(total)}\n\nPode me confirmar a disponibilidade?`;
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
  }

  /** Link direto para um único produto, sem passar pela sacola. */
  quickOrderLink(product: Product, qty = 1): string {
    return this.whatsappLink([{ slug: product.slug, qty, product }]);
  }
}
