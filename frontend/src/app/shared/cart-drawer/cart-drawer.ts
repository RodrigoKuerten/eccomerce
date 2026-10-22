import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CartStore } from '../../core/state/cart.store';
import { Icon } from '../icon/icon';
import { brl } from '../util/format';

@Component({
  selector: 'app-cart-drawer',
  imports: [Icon],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDrawer {
  readonly cart = inject(CartStore);
  readonly subtotal = computed(() => brl(this.cart.subtotal()));
  readonly brl = brl;
}
