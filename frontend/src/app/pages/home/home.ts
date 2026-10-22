import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CatalogStore } from '../../core/state/catalog.store';
import { Icon } from '../../shared/icon/icon';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [ProductCard, Icon],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly catalog = inject(CatalogStore);

  readonly categories = this.catalog.categories;
  readonly deals = this.catalog.deals;
  readonly recommended = this.catalog.recommended;
  readonly loading = this.catalog.loading;
  readonly error = this.catalog.error;

  readonly trust = [
    { icon: 'truck', title: 'Frete grátis', text: 'Em milhares de produtos' },
    { icon: 'shield', title: 'Compra protegida', text: 'Do clique à entrega' },
    { icon: 'refresh', title: 'Troca fácil', text: 'Em até 30 dias' },
    { icon: 'card', title: 'Parcele em 12x', text: 'Sem burocracia' },
  ];

  constructor() {
    this.catalog.load();
  }

  reload(): void {
    this.catalog.reload();
  }
}
