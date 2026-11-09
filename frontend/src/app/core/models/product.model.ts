export interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  seller: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  freeShipping: boolean;
  icon: string;
  quantity?: number;
  available?: boolean;
  hasImage?: boolean;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
}
