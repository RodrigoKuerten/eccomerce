import { environment } from '../../../environments/environment';

export function productImageUrl(id: number): string {
  return `${environment.apiUrl}/products/${id}/image`;
}
