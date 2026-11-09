import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartStore } from '../../core/state/cart.store';
import { AuthStore } from '../../core/state/auth.store';
import { CatalogStore } from '../../core/state/catalog.store';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-header',
  imports: [Icon, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly cart = inject(CartStore);
  readonly auth = inject(AuthStore);

  private readonly catalog = inject(CatalogStore);
  private readonly router = inject(Router);

  readonly categories = computed(() => this.catalog.categories().slice(0, 8));
  readonly firstName = computed(() => this.auth.user()?.fullName.split(' ')[0] ?? 'Entrar');

  constructor() {
    this.catalog.load();
    this.auth.load();
  }

  search(term: string): void {
    const query = term.trim();

    if (!query) {
      this.router.navigate(['/products']);
      return;
    }

    this.router.navigate(['/search'], { queryParams: { q: query } });
  }
}
