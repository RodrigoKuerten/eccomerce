import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/state/auth.store';
import { apiErrorMessage } from '../../shared/util/api-error';
import { PASSWORD_PATTERN } from '../../shared/util/password';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthStore);

  readonly mode = signal<AuthMode>(
    this.route.snapshot.data['mode'] === 'register' ? 'register' : 'login',
  );
  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly returnUrl = this.safeReturnUrl();

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(30)]],
    address: ['', [Validators.required, Validators.maxLength(500)]],
  });

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed())
      .subscribe((data) => this.mode.set(data['mode'] === 'register' ? 'register' : 'login'));
  }

  submitLogin(): void {
    const form = this.loginForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.auth.login(form.getRawValue().email, form.getRawValue().password).subscribe({
      next: () => this.afterAuth(),
      error: (error) => this.fail(error),
    });
  }

  submitRegister(): void {
    const form = this.registerForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.auth.register(form.getRawValue()).subscribe({
      next: () => this.afterAuth(),
      error: (error) => this.fail(error),
    });
  }

  private safeReturnUrl(): string {
    const value = this.route.snapshot.queryParamMap.get('returnUrl');
    return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
  }

  private afterAuth(): void {
    this.submitting.set(false);
    this.router.navigateByUrl(this.returnUrl);
  }

  private fail(error: unknown): void {
    this.submitting.set(false);
    this.errorMessage.set(
      apiErrorMessage(error, 'Não foi possível concluir. Tente novamente.'),
    );
  }
}
