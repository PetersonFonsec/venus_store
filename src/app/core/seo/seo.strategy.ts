import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const SITE = {
  url: 'https://www.usevenusstore.com.br',
  name: 'Use Vênus',
  title: 'Use Vênus | Beleza O Boticário escolhida a dedo',
  description:
    'Perfumes, cuidados e maquiagem O Boticário com curadoria e opinião sincera de uma consultora. Peça pelo WhatsApp.',
};

/** O que cada rota pode definir em `data.seo` (ou via resolver). */
export interface RouteSeo {
  description?: string;
}

/**
 * Aplica título + meta tags (descrição, Open Graph, Twitter e canonical)
 * a cada navegação, a partir do `title` e do `data.seo` da rota.
 * Roda também no prerender, então cada página estática sai com as tags certas.
 */
@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const seo: RouteSeo = route.data['seo'] ?? {};

    const title = this.buildTitle(snapshot) ?? SITE.title;
    const description = seo.description ?? SITE.description;
    const url = SITE.url + snapshot.url.split(/[?#]/)[0];

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });

    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });

    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    this.canonical(url);
  }

  private canonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }
}
