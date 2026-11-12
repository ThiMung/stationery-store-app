export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: string | null;
  categoryName: string | null;
  brand: string | null;
  stock: number;
  rating: number;
}
