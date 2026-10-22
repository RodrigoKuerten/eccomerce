export interface ProductFixture {
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

export interface CategoryFixture {
  slug: string;
  name: string;
  icon: string;
}

export const CATEGORIES: CategoryFixture[] = [
  { slug: 'eletronicos', name: 'Eletrônicos', icon: 'tv' },
  { slug: 'moda', name: 'Moda', icon: 'shirt' },
  { slug: 'casa', name: 'Casa & Decoração', icon: 'sofa' },
  { slug: 'esportes', name: 'Esportes', icon: 'dumbbell' },
  { slug: 'beleza', name: 'Beleza', icon: 'beauty' },
  { slug: 'brinquedos', name: 'Brinquedos', icon: 'ball' },
  { slug: 'games', name: 'Games', icon: 'gamepad' },
  { slug: 'livros', name: 'Livros', icon: 'book' },
  { slug: 'automotivo', name: 'Automotivo', icon: 'car' },
  { slug: 'pet', name: 'Pet Shop', icon: 'pet' },
  { slug: 'ferramentas', name: 'Ferramentas', icon: 'tool' },
  { slug: 'mercado', name: 'Mercado', icon: 'cart' },
];

export const PRODUCTS: ProductFixture[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: `Produto de teste ${index + 1}`,
  category: CATEGORIES[index % CATEGORIES.length].name,
  seller: `Vendedor ${index + 1}`,
  price: 100 + index * 10,
  oldPrice: index % 3 === 0 ? 150 + index * 10 : undefined,
  rating: 4.5,
  reviews: 100 + index,
  freeShipping: index % 2 === 0,
  icon: CATEGORIES[index % CATEGORIES.length].icon,
}));
