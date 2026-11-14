import { Routes } from '@angular/router';
import { sellerGuard } from './core/guards/seller.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Praça — compre e venda de tudo',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'products',
    title: 'Produtos — Praça',
    data: { mode: 'all' },
    loadComponent: () => import('./pages/catalog/catalog').then((m) => m.Catalog),
  },
  {
    path: 'offers',
    title: 'Ofertas do dia — Praça',
    data: { mode: 'deals' },
    loadComponent: () => import('./pages/catalog/catalog').then((m) => m.Catalog),
  },
  {
    path: 'search',
    title: 'Busca — Praça',
    data: { mode: 'search' },
    loadComponent: () => import('./pages/catalog/catalog').then((m) => m.Catalog),
  },
  {
    path: 'category/:slug',
    title: 'Categoria — Praça',
    data: { mode: 'category' },
    loadComponent: () => import('./pages/catalog/catalog').then((m) => m.Catalog),
  },
  {
    path: 'product/:id',
    title: 'Produto — Praça',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'favorites',
    title: 'Favoritos — Praça',
    loadComponent: () => import('./pages/favorites/favorites').then((m) => m.FavoritesPage),
  },
  {
    path: 'account',
    title: 'Minha conta — Praça',
    loadComponent: () => import('./pages/account/account').then((m) => m.AccountPage),
  },
  {
    path: 'login',
    title: 'Entrar — Praça',
    data: { mode: 'login' },
    loadComponent: () => import('./pages/auth/auth').then((m) => m.AuthPage),
  },
  {
    path: 'register',
    title: 'Criar conta — Praça',
    data: { mode: 'register' },
    loadComponent: () => import('./pages/auth/auth').then((m) => m.AuthPage),
  },
  {
    path: 'seller/register',
    title: 'Criar loja — Praça',
    loadComponent: () =>
      import('./pages/seller-onboarding/seller-onboarding').then((m) => m.SellerOnboardingPage),
  },
  {
    path: 'seller',
    title: 'Painel do vendedor — Praça',
    canActivate: [sellerGuard],
    loadComponent: () =>
      import('./pages/seller-dashboard/seller-dashboard').then((m) => m.SellerDashboardPage),
  },
  {
    path: 'seller/new',
    title: 'Novo anúncio — Praça',
    canActivate: [sellerGuard],
    loadComponent: () => import('./pages/seller/seller').then((m) => m.SellerPage),
  },
  {
    path: 'seller/edit/:id',
    title: 'Editar anúncio — Praça',
    canActivate: [sellerGuard],
    loadComponent: () => import('./pages/seller/seller').then((m) => m.SellerPage),
  },
  {
    path: 'orders',
    title: 'Meus pedidos — Praça',
    loadComponent: () => import('./pages/orders/orders').then((m) => m.OrdersPage),
  },
  {
    path: 'checkout',
    title: 'Finalizar compra — Praça',
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.CheckoutPage),
  },
  {
    path: 'help',
    title: 'Central de ajuda — Praça',
    loadComponent: () => import('./pages/help/help').then((m) => m.HelpPage),
  },
  {
    path: 'content/:slug',
    title: 'Praça',
    loadComponent: () => import('./pages/content/content').then((m) => m.ContentPage),
  },
  {
    path: 'error',
    title: 'Algo deu errado — Praça',
    data: { code: '500' },
    loadComponent: () => import('./pages/error/error').then((m) => m.ErrorPage),
  },
  {
    path: '**',
    title: 'Página não encontrada — Praça',
    data: { code: '404' },
    loadComponent: () => import('./pages/error/error').then((m) => m.ErrorPage),
  },
];
