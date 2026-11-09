import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { CartStore } from '../../core/state/cart.store';
import { FavoritesStore } from '../../core/state/favorites.store';
import { Icon } from '../icon/icon';
import { brl, discountPercent, rating } from '../util/format';
import { productImageUrl } from '../util/product-image';

@Component({
  selector: 'app-product-card',
  imports: [Icon, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<Product>();

  private readonly cart = inject(CartStore);
  private readonly favorites = inject(FavoritesStore);

  readonly imageError = signal(false);
  readonly favorite = computed(() => this.favorites.has(this.product().id));
  readonly imageUrl = computed(() =>
    this.product().hasImage ? productImageUrl(this.product().id) : null,
  );
  readonly available = computed(() => this.product().available !== false);
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
    this.favorites.toggle(this.product());
  }

  addToCart(): void {
    if (this.available()) {
      this.cart.add(this.product());
    }
  }
}
