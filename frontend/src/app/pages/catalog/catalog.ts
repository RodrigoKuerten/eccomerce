import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, forkJoin } from 'rxjs';
import { Product } from '../../core/models/product.model';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { Icon } from '../../shared/icon/icon';
import { ProductCard } from '../../shared/product-card/product-card';

type CatalogMode = 'all' | 'deals' | 'search' | 'category';

@Component({
  selector: 'app-catalog',
  imports: [Icon, ProductCard, RouterLink],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalog {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly title = inject(Title);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly heading = signal('Produtos');
  readonly subtitle = signal('');
  readonly emptyText = signal('Nenhum produto encontrado.');

  constructor() {
    combineLatest([this.route.data, this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.load());
  }

  reload(): void {
    this.load();
  }

  private load(): void {
    const mode = (this.route.snapshot.data['mode'] as CatalogMode) ?? 'all';
    const slug = this.route.snapshot.paramMap.get('slug');
    const query = this.route.snapshot.queryParamMap.get('q')?.trim() ?? '';

    this.loading.set(true);
    this.error.set(false);
    this.products.set([]);

    if (mode === 'deals') {
      this.heading.set('Ofertas do dia');
      this.subtitle.set('Descontos que acabam à meia-noite');
      this.emptyText.set('Nenhuma oferta no momento.');
      this.title.setTitle('Ofertas do dia — Praça');
      this.productService
        .getDeals()
        .subscribe({ next: (products) => this.done(products), error: () => this.fail() });
      return;
    }

    if (mode === 'search') {
      this.heading.set(query ? `Resultados para “${query}”` : 'Busca');
      this.subtitle.set(query ? `${query}` : 'Digite um termo no campo de busca');
      this.emptyText.set(query ? `Nada encontrado para “${query}”.` : 'Digite algo para buscar.');
      this.title.setTitle(query ? `${query} — Praça` : 'Busca — Praça');
      const request = query ? this.productService.search(query) : this.productService.getAll();
      request.subscribe({
        next: (products) => this.done(products),
        error: () => this.fail(),
      });
      return;
    }

    if (mode === 'category') {
      this.heading.set('Categoria');
      this.subtitle.set('');
      this.title.setTitle('Categoria — Praça');
      forkJoin({
        categories: this.categoryService.getAll(),
        products: this.productService.getAll(),
      }).subscribe({
        next: ({ categories, products }) => {
          const category = categories.find((item) => item.slug === slug);
          if (!category) {
            this.heading.set('Categoria não encontrada');
            this.emptyText.set('Essa categoria não existe ou foi removida.');
            this.done([]);
            return;
          }

          this.heading.set(category.name);
          this.subtitle.set(`Produtos em ${category.name}`);
          this.emptyText.set(`Nenhum produto em ${category.name} por enquanto.`);
          this.title.setTitle(`${category.name} — Praça`);
          this.done(products.filter((product) => product.category === category.name));
        },
        error: () => this.fail(),
      });
      return;
    }

    this.heading.set('Todos os produtos');
    this.subtitle.set('Tudo o que está disponível na Praça');
    this.emptyText.set('Nenhum produto disponível no momento.');
    this.title.setTitle('Produtos — Praça');
    this.productService
      .getAll()
      .subscribe({ next: (products) => this.done(products), error: () => this.fail() });
  }

  private done(products: Product[]): void {
    this.products.set(products);
    this.loading.set(false);
  }

  private fail(): void {
    this.error.set(true);
    this.loading.set(false);
  }
}
