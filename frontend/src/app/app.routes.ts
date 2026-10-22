import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Praça — compre e venda de tudo',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  { path: '**', redirectTo: '' },
];
