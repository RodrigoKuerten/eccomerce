import { inject, Provider } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { ProductService } from '../services/product.service';
import { CartStore } from './cart.store';
import { CatalogStore } from './catalog.store';

export function provideStores(): Provider[] {
  return [
    { provide: CartStore, useFactory: () => new CartStore() },
    {
      provide: CatalogStore,
      useFactory: () => new CatalogStore(inject(ProductService), inject(CategoryService)),
    },
  ];
}
