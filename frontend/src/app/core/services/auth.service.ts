import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SessionUser {
  id: number;
  email: string;
  fullName: string;
  role: 'BUYER' | 'SELLER';
  storeName?: string | null;
}

export interface AuthMessage {
  message: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  address: string;
  phoneNumber: string;
}

export interface RegisterSellerPayload extends RegisterPayload {
  cpf: string;
  storeName: string;
  storeDescription: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  login(email: string, password: string): Observable<AuthMessage> {
    return this.http.post<AuthMessage>(
      `${this.baseUrl}/login`,
      { email, password },
      { withCredentials: true },
    );
  }

  register(payload: RegisterPayload): Observable<AuthMessage> {
    return this.http.post<AuthMessage>(`${this.baseUrl}/register`, payload, {
      withCredentials: true,
    });
  }

  registerSeller(payload: RegisterSellerPayload): Observable<AuthMessage> {
    return this.http.post<AuthMessage>(`${this.baseUrl}/register-seller`, payload, {
      withCredentials: true,
    });
  }

  me(): Observable<SessionUser> {
    return this.http.get<SessionUser>(`${this.baseUrl}/me`, { withCredentials: true });
  }

  logout(): Observable<AuthMessage> {
    return this.http.post<AuthMessage>(`${this.baseUrl}/logout`, {}, { withCredentials: true });
  }
}
