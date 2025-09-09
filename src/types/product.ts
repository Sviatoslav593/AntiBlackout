export interface Product {
  id: string;
  external_id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badge?: string;
  capacity: number;
  brand: string;
  popularity: number;
  createdAt: string;
  category: string;
  category_id?: number;
  categories?: {
    id: number;
    name: string;
    parent_id?: number;
  };
  vendor_code?: string;
  quantity?: number;
  characteristics?: Record<string, any>;
}
