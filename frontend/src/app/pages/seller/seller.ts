import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Category, Product } from '../../core/models/product.model';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { AuthStore } from '../../core/state/auth.store';
import { Icon } from '../../shared/icon/icon';
import { apiErrorMessage } from '../../shared/util/api-error';
import { readFileAsDataUrl, validateImageFile } from '../../shared/util/image';
import { productImageUrl } from '../../shared/util/product-image';

@Component({
  selector: 'app-seller',
  imports: [Icon, ReactiveFormsModule, RouterLink],
  templateUrl: './seller.html',
  styleUrl: './seller.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerPage {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  readonly auth = inject(AuthStore);
  readonly categories = signal<Category[]>([]);
  readonly product = signal<Product | null>(null);
  readonly editId = signal<number | null>(null);
  readonly editing = computed(() => this.editId() !== null);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly imagePreview = signal<string | null>(null);
  readonly imageError = signal('');
  readonly hasNewImage = signal(false);
  readonly returnUrl = this.router.url;
  private imageBase64: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    category: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    oldPrice: [null as number | null, [Validators.min(0)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const editId = Number.isFinite(id) && id > 0 ? id : null;
    this.editId.set(editId);
    this.title.setTitle(editId ? 'Editar anúncio — Praça' : 'Novo anúncio — Praça');
    this.auth.load();

    forkJoin({
      categories: this.categoryService.getAll().pipe(catchError(() => of([]))),
      product: editId ? this.productService.getById(editId) : of(null),
    }).subscribe({
      next: ({ categories, product }) => {
        this.categories.set(categories);
        if (product) {
          this.product.set(product);
          this.patchProduct(product, categories);
        }
      },
      error: () => this.errorMessage.set('Não foi possível carregar o anúncio para edição.'),
    });
  }

  async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageError.set('');
    this.hasNewImage.set(false);

    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      this.imageError.set(validationError);
      input.value = '';
      return;
    }

    try {
      const result = await readFileAsDataUrl(file);
      this.imagePreview.set(result);
      this.imageBase64 = result.split(',')[1] ?? null;
      this.hasNewImage.set(true);
    } catch {
      this.imageError.set('Não foi possível ler a imagem.');
    }
  }

  clearImage(): void {
    this.imageBase64 = null;
    this.hasNewImage.set(false);
    this.imageError.set('');

    const product = this.product();
    this.imagePreview.set(
      this.editing() && product?.hasImage ? productImageUrl(product.id) : null,
    );
  }

  submit(): void {
    const user = this.auth.user();
    if (!user) {
      this.errorMessage.set('Entre na sua conta para anunciar.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const existing = this.product();
    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      name: value.name,
      description: value.description,
      category: value.category.toUpperCase(),
      price: Number(value.price),
      oldPrice: value.oldPrice ? Number(value.oldPrice) : null,
      seller: user.fullName,
      rating: existing?.rating ?? 0,
      reviews: existing?.reviews ?? 0,
      quantity: Number(value.quantity),
      image: this.imageBase64,
    };

    const request = this.editing()
      ? this.productService.update({ ...payload, id: this.editId() as number })
      : this.productService.create(payload);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set(
          this.editing() ? 'Anúncio atualizado com sucesso!' : 'Anúncio publicado com sucesso!',
        );

        if (!this.editing()) {
          this.form.reset({
            name: '',
            description: '',
            category: '',
            price: 0,
            oldPrice: null,
            quantity: 1,
          });
          this.imagePreview.set(null);
          this.imageBase64 = null;
          this.hasNewImage.set(false);
        }
      },
      error: (error) => {
        this.submitting.set(false);
        this.errorMessage.set(
          apiErrorMessage(error, 'Não foi possível salvar o anúncio. Tente novamente.'),
        );
      },
    });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/']),
    });
  }

  private patchProduct(product: Product, categories: Category[]): void {
    const category = categories.find((item) => item.name === product.category)?.slug ?? '';

    this.form.patchValue({
      name: product.name,
      description: product.description ?? '',
      category,
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
      quantity: product.quantity ?? 1,
    });

    if (product.hasImage) {
      this.imagePreview.set(productImageUrl(product.id));
    }
  }
}
