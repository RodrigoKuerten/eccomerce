import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { CartStore } from '../../core/state/cart.store';
import { Icon } from '../icon/icon';
import { brl } from '../util/format';

@Component({
  selector: 'app-cart-drawer',
  imports: [Icon],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class CartDrawer {
  readonly cart = inject(CartStore);
  readonly subtotal = computed(() => brl(this.cart.subtotal()));
  readonly brl = brl;

  private readonly injector = inject(Injector);
  private readonly drawer = viewChild<ElementRef<HTMLElement>>('drawer');
  private lastFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (typeof document === 'undefined') return;

      const open = this.cart.isOpen();
      const el = this.drawer()?.nativeElement;

      if (open) {
        this.lastFocused = document.activeElement as HTMLElement | null;
        document.body.style.overflow = 'hidden';
        if (el) afterNextRender(() => el.focus(), { injector: this.injector });
      } else {
        document.body.style.overflow = '';
        this.lastFocused?.focus();
        this.lastFocused = null;
      }
    });

    effect(() => {
      this.cart.list();
      if (typeof document === 'undefined' || !this.cart.isOpen()) return;

      afterNextRender(
        () => {
          const drawer = this.drawer()?.nativeElement;
          if (drawer && !drawer.contains(document.activeElement)) drawer.focus();
        },
        { injector: this.injector },
      );
    });
  }

  protected onEscape(): void {
    if (this.cart.isOpen()) this.cart.hide();
  }

  protected onKeydown(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Tab' || !this.cart.isOpen()) return;

    const drawer = this.drawer()?.nativeElement;
    if (!drawer) return;
    const focusables = Array.from(
      drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (!active || !drawer.contains(active)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (event.shiftKey && (active === first || active === drawer)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
