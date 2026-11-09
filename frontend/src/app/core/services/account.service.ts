import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AccountProfile {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  cpf: string | null;
}

export interface UpdateProfilePayload {
  fullName: string;
  phoneNumber: string;
  address: string;
  cpf: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/account`;

  getProfile(): Observable<AccountProfile> {
    return this.http.get<AccountProfile>(this.baseUrl, { withCredentials: true });
  }

  updateProfile(payload: UpdateProfilePayload): Observable<AccountProfile> {
    return this.http.put<AccountProfile>(`${this.baseUrl}/profile`, payload, {
      withCredentials: true,
    });
  }

  changePassword(payload: ChangePasswordPayload): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/password`, payload, {
      withCredentials: true,
    });
  }
}
