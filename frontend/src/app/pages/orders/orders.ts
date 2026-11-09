import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Order } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';
import { AuthStore } from '../../core/state/auth.store';
import { Icon } from '../../shared/icon/icon';
import { brl, dateBr } from '../../shared/util/format';
import { orderStatusLabel } from '../../shared/util/order-status';
import { productImageUrl } from '../../shared/util/product-image';

@Component({
  selector: 'app-orders',
  imports: [Icon, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage {
  private readonly orderService = inject(OrderService);
  private readonly title = inject(Title);

  readonly auth = inject(AuthStore);
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly imageUrl = productImageUrl;
  readonly statusLabel = orderStatusLabel;
  readonly dateLabel = dateBr;
  readonly brl = brl;

  constructor() {
    this.title.setTitle('Meus pedidos — Praça');
    this.auth.load();

    effect(() => {
      const user = this.auth.user();
      if (user) this.loadFor(user.id);
    });
  }

  load(): void {
    const user = this.auth.user();
    if (user) this.loadFor(user.id);
  }

  private loadFor(userId: number): void {
    this.loading.set(true);
    this.error.set(false);
    this.orderService.listByUser(userId).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
