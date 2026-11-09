import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesStore } from '../../core/state/favorites.store';
import { Icon } from '../../shared/icon/icon';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-favorites',
  imports: [Icon, ProductCard, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPage {
  readonly favorites = inject(FavoritesStore);
}
