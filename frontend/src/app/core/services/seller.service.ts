import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';

export interface SellerSalesDay {
  label: string;
  revenue: number;
  orders: number;
}

export interface SellerUpgradePayload {
  storeName: string;
  storeDescription: string;
  cpf?: string | null;
}

export interface SellerDashboard {
  productCount: number;
  totalStock: number;
  inventoryValue: number;
  outOfStock: number;
  orderCount: number;
  products: Product[];
  recentOrders: Order[];
  salesLast7Days: SellerSalesDay[];
}

@Injectable({ providedIn: 'root' })
export class SellerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/seller`;

  dashboard(): Observable<SellerDashboard> {
    return this.http.get<SellerDashboard>(`${this.baseUrl}/dashboard`, {
      withCredentials: true,
    });
  }

  upgrade(payload: SellerUpgradePayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/upgrade`, payload, {
      withCredentials: true,
    });
  }
}
