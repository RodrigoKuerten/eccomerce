import { inject, Provider } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { ProductService } from '../services/product.service';
import { AuthStore } from './auth.store';
import { CartStore } from './cart.store';
import { CatalogStore } from './catalog.store';
import { FavoritesStore } from './favorites.store';

export function provideStores(): Provider[] {
  return [
    { provide: AuthStore, useFactory: () => new AuthStore() },
    { provide: FavoritesStore, useFactory: () => new FavoritesStore() },
    { provide: CartStore, useFactory: () => new CartStore() },
    {
      provide: CatalogStore,
      useFactory: () => new CatalogStore(inject(ProductService), inject(CategoryService)),
    },
  ];
}
