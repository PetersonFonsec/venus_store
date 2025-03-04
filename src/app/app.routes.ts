import { Routes } from '@angular/router';
import { ApresentationComponent } from './pages/apresentation/apresentation.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/apresentation',
    pathMatch: 'full'
  },
  {
    path: 'apresentation',
    component: ApresentationComponent,
    title: 'Use Venus Store',
  },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Home - Use Venus Store',
  },
  {
    path: 'about',
    component: AboutComponent,
    title: 'Sobre nós - Use Venus Store',
  },
  {
    path: 'cart',
    component: AboutComponent,
    title: 'Carrinho - Use Venus Store',
  },
  { path: '**', component: ApresentationComponent }
];
