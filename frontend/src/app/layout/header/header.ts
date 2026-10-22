import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CartStore } from '../../core/state/cart.store';
import { CatalogStore } from '../../core/state/catalog.store';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-header',
  imports: [Icon],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly cart = inject(CartStore);

  private readonly catalog = inject(CatalogStore);
  readonly categories = computed(() => this.catalog.categories().slice(0, 8));

  constructor() {
    this.catalog.load();
  }
}
