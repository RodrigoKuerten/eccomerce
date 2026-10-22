import { computed, signal } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  qty: number;
}

export class CartStore {
  private readonly items = signal<CartItem[]>([]);
  private readonly open = signal(false);

  readonly list = this.items.asReadonly();
  readonly isOpen = this.open.asReadonly();

  readonly count = computed(() => this.items().reduce((sum, item) => sum + item.qty, 0));
  readonly subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.qty * item.product.price, 0),
  );

  add(product: Product, qty = 1): void {
    this.items.update((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + qty } : item,
        );
      }
      return [...items, { product, qty }];
    });
    this.open.set(true);
  }

  remove(productId: number): void {
    this.items.update((items) => items.filter((item) => item.product.id !== productId));
  }

  decrement(productId: number): void {
    this.items.update((items) =>
      items.flatMap((item) => {
        if (item.product.id !== productId) return [item];
        return item.qty > 1 ? [{ ...item, qty: item.qty - 1 }] : [];
      }),
    );
  }

  show(): void {
    this.open.set(true);
  }

  hide(): void {
    this.open.set(false);
  }
}
