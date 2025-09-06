import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are missing. Please check your .env.local file contains:\n" +
      "NEXT_PUBLIC_SUPABASE_URL=your-project-url\n" +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client for API routes (with service role key)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Server Supabase environment variables are missing. Please check your .env.local file contains:\n" +
        "NEXT_PUBLIC_SUPABASE_URL=your-project-url\n" +
        "SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

// Database types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  brand?: string;
  capacity?: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  city: string;
  branch: string;
  payment_method: string;
  total_amount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}
