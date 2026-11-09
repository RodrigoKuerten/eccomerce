import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { AccountProfile, AccountService } from '../../core/services/account.service';
import { SellerService } from '../../core/services/seller.service';
import { AuthStore } from '../../core/state/auth.store';
import { Icon } from '../../shared/icon/icon';
import { apiErrorMessage } from '../../shared/util/api-error';
import { CPF_INPUT_PATTERN, cpfDigits, formatCpf } from '../../shared/util/cpf';

@Component({
  selector: 'app-seller-onboarding',
  imports: [Icon, ReactiveFormsModule, RouterLink],
  templateUrl: './seller-onboarding.html',
  styleUrl: './seller-onboarding.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerOnboardingPage {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly sellerService = inject(SellerService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);

  readonly auth = inject(AuthStore);
  readonly profile = signal<AccountProfile | null>(null);
  readonly loadingProfile = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly needsCpf = signal(false);
  private profileRequested = false;

  readonly form = this.fb.nonNullable.group({
    storeName: ['', [Validators.required, Validators.maxLength(150)]],
    storeDescription: ['', [Validators.required, Validators.maxLength(2000)]],
    cpf: ['', [Validators.pattern(CPF_INPUT_PATTERN), Validators.maxLength(14)]],
  });

  constructor() {
    this.title.setTitle('Quero vender — Praça');
    this.auth.load();

    effect(() => {
      if (this.auth.isSeller()) {
        this.router.navigate(['/seller']);
      }
    });

    effect(() => {
      const user = this.auth.user();
      if (user && !this.auth.isSeller() && !this.profileRequested) {
        this.profileRequested = true;
        this.loadProfile();
      }
    });
  }

  submit(): void {
    if (!this.auth.isAuthenticated()) {
      this.errorMessage.set('Entre na sua conta para começar a vender.');
      return;
    }

    if (this.auth.isSeller()) {
      this.router.navigate(['/seller']);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const cpf = cpfDigits(value.cpf);

    if (this.needsCpf() && cpf.length !== 11) {
      this.errorMessage.set('Informe um CPF com 11 dígitos para ativar sua loja.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.sellerService
      .upgrade({
        storeName: value.storeName,
        storeDescription: value.storeDescription,
        cpf: this.needsCpf() ? cpf : null,
      })
      .subscribe({
        next: () => {
          this.auth.refresh().subscribe({
            next: () => {
              this.submitting.set(false);
              this.router.navigate(['/seller']);
            },
            error: () => {
              this.submitting.set(false);
              this.errorMessage.set('Loja ativada, mas não foi possível atualizar a sessão. Entre novamente.');
            },
          });
        },
        error: (error) => {
          this.submitting.set(false);
          this.errorMessage.set(
            apiErrorMessage(error, 'Não foi possível ativar sua loja. Tente novamente.'),
          );
        },
      });
  }

  private loadProfile(): void {
    this.loadingProfile.set(true);

    this.accountService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.needsCpf.set(!profile.cpf);

        if (profile.cpf) {
          this.form.patchValue({ cpf: formatCpf(profile.cpf) });
        }

        this.loadingProfile.set(false);
      },
      error: () => {
        this.loadingProfile.set(false);
        this.needsCpf.set(true);
        this.errorMessage.set('Não foi possível carregar os dados da sua conta. Preencha o CPF para continuar.');
      },
    });
  }
}
