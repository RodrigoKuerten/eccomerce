import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import { AuthStore } from '../../core/state/auth.store';
import { CartStore } from '../../core/state/cart.store';
import { Icon } from '../../shared/icon/icon';
import { apiErrorMessage } from '../../shared/util/api-error';
import { brl } from '../../shared/util/format';

@Component({
  selector: 'app-checkout',
  imports: [Icon, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly orderService = inject(OrderService);
  private readonly title = inject(Title);

  readonly auth = inject(AuthStore);
  readonly cart = inject(CartStore);
  readonly subtotal = computed(() => brl(this.cart.subtotal()));
  readonly brl = brl;
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly success = signal(false);

  constructor() {
    this.title.setTitle('Finalizar compra — Praça');
    this.auth.load();
  }

  confirm(): void {
    const user = this.auth.user();
    const items = this.cart.list();

    if (!user) {
      this.errorMessage.set('Entre na sua conta para finalizar o pedido.');
      return;
    }

    if (items.length === 0) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    forkJoin(
      items.map((item) =>
        this.orderService.create({
          userId: user.id,
          productId: item.product.id,
          quantity: item.qty,
        }),
      ),
    ).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        this.cart.clear();
      },
      error: (error) => {
        this.submitting.set(false);
        this.errorMessage.set(
          apiErrorMessage(error, 'Não foi possível finalizar o pedido. Tente novamente.'),
        );
      },
    });
  }
}
