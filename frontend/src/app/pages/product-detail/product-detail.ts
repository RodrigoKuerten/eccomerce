import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartStore } from '../../core/state/cart.store';
import { FavoritesStore } from '../../core/state/favorites.store';
import { Icon } from '../../shared/icon/icon';
import { brl, discountPercent, rating } from '../../shared/util/format';
import { productImageUrl } from '../../shared/util/product-image';

@Component({
  selector: 'app-product-detail',
  imports: [Icon, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly title = inject(Title);
  private readonly cart = inject(CartStore);
  private readonly favorites = inject(FavoritesStore);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly imageError = signal(false);

  readonly price = computed(() => {
    const product = this.product();
    return product ? brl(product.price) : '';
  });
  readonly oldPrice = computed(() => {
    const product = this.product();
    return product?.oldPrice ? brl(product.oldPrice) : null;
  });
  readonly installment = computed(() => {
    const product = this.product();
    return product ? brl(product.price / 12) : '';
  });
  readonly discount = computed(() => {
    const product = this.product();
    return product?.oldPrice ? discountPercent(product.price, product.oldPrice) : 0;
  });
  readonly score = computed(() => {
    const product = this.product();
    return product ? rating(product.rating) : '';
  });
  readonly favorite = computed(() => {
    const product = this.product();
    return product ? this.favorites.has(product.id) : false;
  });
  readonly imageUrl = computed(() => {
    const product = this.product();
    return product?.hasImage ? productImageUrl(product.id) : null;
  });

  constructor() {
    this.route.paramMap.subscribe(() => this.load());
  }

  reload(): void {
    this.load();
  }

  toggleFavorite(): void {
    const product = this.product();
    if (product) this.favorites.toggle(product);
  }

  addToCart(): void {
    const product = this.product();
    if (product && product.available !== false) {
      this.cart.add(product);
    }
  }

  private load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id)) {
      this.error.set(true);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(false);
    this.imageError.set(false);

    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.title.setTitle(`${product.name} — Praça`);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
