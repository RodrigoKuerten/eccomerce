import { signal } from '@angular/core';
import { Product } from '../models/product.model';

const STORAGE_KEY = 'praca:favorites';

export class FavoritesStore {
  private readonly itemsSignal = signal<Product[]>(this.read());

  readonly items = this.itemsSignal.asReadonly();

  has(id: number): boolean {
    return this.itemsSignal().some((product) => product.id === id);
  }

  toggle(product: Product): void {
    const items = this.itemsSignal();
    const next = items.some((item) => item.id === product.id)
      ? items.filter((item) => item.id !== product.id)
      : [...items, product];

    this.itemsSignal.set(next);
    this.persist(next);
  }

  private read(): Product[] {
    if (typeof window === 'undefined') return [];

    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return value ? (JSON.parse(value) as Product[]) : [];
    } catch {
      return [];
    }
  }

  private persist(items: Product[]): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage may be disabled; favorites stay in memory
    }
  }
}
