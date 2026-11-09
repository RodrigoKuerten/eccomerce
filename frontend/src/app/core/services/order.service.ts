import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOrderPayload, Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/order`;

  create(payload: CreateOrderPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/create`, payload, {
      withCredentials: true,
    });
  }

  listByUser(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/user/${userId}`, {
      withCredentials: true,
    });
  }
}
