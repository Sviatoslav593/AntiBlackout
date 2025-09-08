export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badge?: string;
  capacity: number;
  brand: string;
  popularity: number;
  createdAt: string;
  category: string;
}
