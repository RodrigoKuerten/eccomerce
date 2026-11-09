import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { AccountProfile, AccountService } from '../../core/services/account.service';
import { AuthStore } from '../../core/state/auth.store';
import { Icon } from '../../shared/icon/icon';
import { apiErrorMessage } from '../../shared/util/api-error';
import { CPF_INPUT_PATTERN, cpfDigits, formatCpf } from '../../shared/util/cpf';
import { PASSWORD_PATTERN } from '../../shared/util/password';

type AccountTab = 'profile' | 'security';

@Component({
  selector: 'app-account',
  imports: [Icon, ReactiveFormsModule, RouterLink],
  templateUrl: './account.html',
  styleUrl: './account.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountPage {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private loadedFor: number | null = null;

  readonly auth = inject(AuthStore);
  readonly tab = signal<AccountTab>('profile');
  readonly profile = signal<AccountProfile | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly savingProfile = signal(false);
  readonly profileMessage = signal('');
  readonly profileError = signal('');
  readonly savingPassword = signal(false);
  readonly passwordMessage = signal('');
  readonly passwordError = signal('');

  readonly profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(30)]],
    address: ['', [Validators.required, Validators.maxLength(500)]],
    cpf: ['', [Validators.pattern(CPF_INPUT_PATTERN)]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]],
    confirmPassword: ['', [Validators.required]],
  });

  constructor() {
    this.title.setTitle('Minha conta — Praça');
    this.auth.load();

    effect(() => {
      const user = this.auth.user();
      if (user && this.loadedFor !== user.id) {
        this.loadedFor = user.id;
        this.loadProfile();
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    this.savingProfile.set(true);
    this.profileMessage.set('');
    this.profileError.set('');

    this.accountService
      .updateProfile({
        fullName: value.fullName,
        phoneNumber: value.phoneNumber,
        address: value.address,
        cpf: cpfDigits(value.cpf) || null,
      })
      .subscribe({
        next: (profile) => {
          this.savingProfile.set(false);
          this.profile.set(profile);
          this.patchProfile(profile);
          this.profileMessage.set('Dados atualizados com sucesso.');
          this.auth.refresh().subscribe({ next: () => undefined, error: () => undefined });
        },
        error: (error) => {
          this.savingProfile.set(false);
          this.profileError.set(apiErrorMessage(error, 'Não foi possível salvar seus dados.'));
        },
      });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.passwordError.set('A confirmação não confere com a nova senha.');
      return;
    }

    this.savingPassword.set(true);
    this.passwordMessage.set('');
    this.passwordError.set('');

    this.accountService
      .changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      })
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.passwordMessage.set('Senha alterada com sucesso.');
          this.passwordForm.reset();
        },
        error: (error) => {
          this.savingPassword.set(false);
          this.passwordError.set(apiErrorMessage(error, 'Não foi possível alterar a senha.'));
        },
      });
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/']),
    });
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.error.set(false);

    this.accountService.getProfile().subscribe({
      next: (profile) => {
        this.loading.set(false);
        this.profile.set(profile);
        this.patchProfile(profile);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  private patchProfile(profile: AccountProfile): void {
    this.profileForm.patchValue({
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      address: profile.address,
      cpf: formatCpf(profile.cpf),
    });
  }
}
