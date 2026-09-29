import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Use Vênus | Beleza O Boticário escolhida a dedo',
  },
  {
    path: 'produtos',
    loadComponent: () => import('./pages/catalog/catalog.component').then((m) => m.CatalogComponent),
    title: 'Produtos · Use Vênus',
  },
  {
    path: 'produtos/:slug',
    loadComponent: () => import('./pages/product/product.component').then((m) => m.ProductComponent),
  },
  {
    path: 'sobre',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'Sobre mim · Use Vênus',
  },
  { path: '**', redirectTo: '' },
];
