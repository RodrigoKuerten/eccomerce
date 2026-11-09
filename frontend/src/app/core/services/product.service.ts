import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

export interface CreateProductPayload {
  name: string;
  description: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  seller?: string;
  rating?: number;
  reviews?: number;
  quantity: number;
  image?: string | null;
}

export interface UpdateProductPayload extends CreateProductPayload {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getDeals(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/deals`);
  }

  getRecommended(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/recommended`);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  search(term: string): Observable<Product[]> {
    const params = new HttpParams().set('q', term);
    return this.http.get<Product[]>(this.baseUrl, { params });
  }

  create(payload: CreateProductPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/product/create`,
      payload,
      { withCredentials: true },
    );
  }

  update(payload: UpdateProductPayload): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${environment.apiUrl}/product/edit`,
      payload,
      { withCredentials: true },
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/product/delete`,
      { body: id, withCredentials: true },
    );
  }
}
