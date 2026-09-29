import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Routes } from '@angular/router';

import { CatalogService } from './core/services/catalog.service';
import { RouteSeo, SITE } from './core/seo/seo.strategy';

/** Corta no limite de palavra, no tamanho que o Google mostra. */
const clip = (text: string, max = 155) => (text.length <= max ? text : `${text.slice(0, max).replace(/\s+\S*$/, '')}…`);

const productBySlug = (route: ActivatedRouteSnapshot) => inject(CatalogService).bySlug(route.paramMap.get('slug')!);

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: SITE.title,
  },
  {
    path: 'produtos',
    loadComponent: () => import('./pages/catalog/catalog.component').then((m) => m.CatalogComponent),
    title: 'Produtos · Use Vênus',
    data: {
      seo: {
        description:
          'Perfumaria, corpo & banho, skincare e maquiagem O Boticário, cada um com a minha opinião sincera. Monte a sacola e peça pelo WhatsApp.',
      } satisfies RouteSeo,
    },
  },
  {
    path: 'produtos/:slug',
    loadComponent: () => import('./pages/product/product.component').then((m) => m.ProductComponent),
    title: (route) => {
      const p = productBySlug(route);
      return p ? `${p.name} · Use Vênus` : SITE.title;
    },
    resolve: {
      seo: (route: ActivatedRouteSnapshot): RouteSeo => {
        const p = productBySlug(route);
        return { description: p ? clip(`${p.line} ${p.size}. ${p.review.text}`) : undefined };
      },
    },
  },
  {
    path: 'sobre',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'Sobre mim · Use Vênus',
    data: {
      seo: {
        description:
          'Conheça a consultora por trás da Use Vênus: curadoria O Boticário, produtos testados na pele e atendimento de amiga pelo WhatsApp.',
      } satisfies RouteSeo,
    },
  },
  { path: '**', redirectTo: '' },
];
