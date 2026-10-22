import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

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
}
