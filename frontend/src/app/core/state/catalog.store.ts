import { signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Category, Product } from '../models/product.model';
import { CategoryService } from '../services/category.service';
import { ProductService } from '../services/product.service';

export class CatalogStore {
  private readonly _categories = signal<Category[]>([]);
  private readonly _deals = signal<Product[]>([]);
  private readonly _recommended = signal<Product[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal(false);
  private started = false;

  readonly categories = this._categories.asReadonly();
  readonly deals = this._deals.asReadonly();
  readonly recommended = this._recommended.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
  ) {}

  load(): void {
    if (this.started) return;
    this.started = true;
    this.fetch();
  }

  reload(): void {
    this.fetch();
  }

  private fetch(): void {
    this._loading.set(true);
    this._error.set(false);

    this.categoryService.getAll().subscribe({
      next: (categories) => this._categories.set(categories),
      error: () => this._categories.set([]),
    });

    forkJoin({
      deals: this.productService.getDeals(),
      recommended: this.productService.getRecommended(),
    }).subscribe({
      next: ({ deals, recommended }) => {
        this._deals.set(deals);
        this._recommended.set(recommended);
        this._loading.set(false);
      },
      error: () => {
        this._error.set(true);
        this._loading.set(false);
      },
    });
  }
}
