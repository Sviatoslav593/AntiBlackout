import { supabase, Product } from "@/lib/supabase";

export class ProductService {
  // Get all products
  static async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }

    return data || [];
  }

  // Get product by ID
  static async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }

    return data;
  }

  // Create new product
  static async createProduct(
    product: Omit<Product, "id" | "created_at">
  ): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }

    return data;
  }

  // Update product
  static async updateProduct(
    id: string,
    updates: Partial<Omit<Product, "id" | "created_at">>
  ): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw new Error("Failed to update product");
    }

    return data;
  }

  // Delete product
  static async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw new Error("Failed to delete product");
    }
  }

  // Update product stock
  static async updateStock(id: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ stock: quantity })
      .eq("id", id);

    if (error) {
      console.error("Error updating stock:", error);
      throw new Error("Failed to update stock");
    }
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(
        `name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching products:", error);
      throw new Error("Failed to search products");
    }

    return data || [];
  }
}
