import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { CartStore } from '../../core/state/cart.store';
import { Icon } from '../icon/icon';
import { brl, discountPercent, rating } from '../util/format';

@Component({
  selector: 'app-product-card',
  imports: [Icon],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<Product>();

  private readonly cart = inject(CartStore);

  readonly favorite = signal(false);
  readonly price = computed(() => brl(this.product().price));
  readonly oldPrice = computed(() =>
    this.product().oldPrice ? brl(this.product().oldPrice as number) : null,
  );
  readonly discount = computed(() =>
    this.product().oldPrice
      ? discountPercent(this.product().price, this.product().oldPrice as number)
      : 0,
  );
  readonly score = computed(() => rating(this.product().rating));

  toggleFavorite(): void {
    this.favorite.update((value) => !value);
  }

  addToCart(): void {
    this.cart.add(this.product());
  }
}
