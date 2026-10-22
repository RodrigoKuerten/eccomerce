export interface Product {
  id: number;
  name: string;
  category: string;
  seller: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  freeShipping: boolean;
  icon: string;
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
}
