import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { SellerDashboard, SellerSalesDay, SellerService } from '../../core/services/seller.service';
import { AuthStore } from '../../core/state/auth.store';
import { Icon } from '../../shared/icon/icon';
import { brl, dateBr } from '../../shared/util/format';
import { orderStatusLabel } from '../../shared/util/order-status';
import { productImageUrl } from '../../shared/util/product-image';

@Component({
  selector: 'app-seller-dashboard',
  imports: [Icon, RouterLink],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerDashboardPage {
  private readonly sellerService = inject(SellerService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private loadedFor: number | null = null;

  readonly auth = inject(AuthStore);
  readonly dashboard = signal<SellerDashboard | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly brl = brl;
  readonly imageUrl = productImageUrl;
  readonly statusLabel = orderStatusLabel;
  readonly dateLabel = dateBr;
  readonly inventoryValue = computed(() => brl(this.dashboard()?.inventoryValue ?? 0));
  readonly sales = computed(() => this.dashboard()?.salesLast7Days ?? []);
  readonly salesTotal = computed(() => this.sales().reduce((total, day) => total + day.revenue, 0));
  private readonly salesPeak = computed(() =>
    Math.max(1, ...this.sales().map((day) => day.revenue)),
  );

  constructor() {
    this.title.setTitle('Painel do vendedor — Praça');
    this.auth.load();

    effect(() => {
      const user = this.auth.user();
      if (user?.role === 'SELLER' && this.loadedFor !== user.id) {
        this.loadedFor = user.id;
        this.load();
      }
    });
  }

  barHeight(revenue: number): number {
    return Math.max(3, Math.round((revenue / this.salesPeak()) * 100));
  }

  salesSummary(): string {
    const days = this.sales();
    if (days.length === 0) return 'Ainda não há vendas nos últimos 7 dias.';

    const detail = days
      .map((day) => `${day.label}: ${brl(day.revenue)}, ${day.orders} pedido(s)`)
      .join('; ');

    return `Receita dos últimos 7 dias: ${brl(this.salesTotal())}. ${detail}.`;
  }

  salesDayTitle(day: SellerSalesDay): string {
    return `${day.label}: ${brl(day.revenue)} · ${day.orders} pedido(s)`;
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);

    this.sellerService.dashboard().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  remove(productId: number, productName: string): void {
    if (!window.confirm(`Excluir o anúncio "${productName}"?`)) return;

    this.productService.delete(productId).subscribe({
      next: () => this.load(),
      error: () => this.error.set(true),
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/']),
    });
  }
}
