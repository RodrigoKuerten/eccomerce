import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthStore } from '../state/auth.store';

export const sellerGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  return auth
    .ensure()
    .pipe(
      map((user) => (user?.role === 'SELLER' ? true : router.createUrlTree(['/seller/register']))),
    );
};
