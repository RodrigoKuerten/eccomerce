import { computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, tap } from 'rxjs';
import {
  AuthService,
  AuthMessage,
  RegisterPayload,
  RegisterSellerPayload,
  SessionUser,
} from '../services/auth.service';

export class AuthStore {
  private readonly auth = inject(AuthService);
  private readonly userSignal = signal<SessionUser | null>(null);
  private readonly readySignal = signal(false);
  private ensureRequest: Observable<SessionUser | null> | null = null;

  readonly user = this.userSignal.asReadonly();
  readonly ready = this.readySignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly isSeller = computed(() => this.userSignal()?.role === 'SELLER');

  load(): void {
    this.ensure().subscribe();
  }

  ensure(): Observable<SessionUser | null> {
    if (this.readySignal()) return of(this.userSignal());

    if (typeof window === 'undefined') {
      this.readySignal.set(true);
      return of(null);
    }

    if (this.ensureRequest) return this.ensureRequest;

    this.ensureRequest = this.auth.me().pipe(
      map((user): SessionUser | null => user),
      catchError(() => of(null)),
      tap((user) => this.userSignal.set(user)),
      finalize(() => {
        this.readySignal.set(true);
        this.ensureRequest = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.ensureRequest;
  }

  login(email: string, password: string): Observable<SessionUser> {
    return this.auth.login(email, password).pipe(
      switchMap(() => this.auth.me()),
      tap((user) => this.userSignal.set(user)),
    );
  }

  register(payload: RegisterPayload): Observable<SessionUser> {
    return this.auth.register(payload).pipe(
      switchMap(() => this.auth.me()),
      tap((user) => this.userSignal.set(user)),
    );
  }

  registerSeller(payload: RegisterSellerPayload): Observable<SessionUser> {
    return this.auth.registerSeller(payload).pipe(
      switchMap(() => this.auth.me()),
      tap((user) => this.userSignal.set(user)),
    );
  }

  refresh(): Observable<SessionUser> {
    return this.auth.me().pipe(tap((user) => this.userSignal.set(user)));
  }

  logout(): Observable<AuthMessage> {
    return this.auth.logout().pipe(tap(() => this.userSignal.set(null)));
  }
}
