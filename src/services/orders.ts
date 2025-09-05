import { supabase, Order, OrderWithItems } from "@/lib/supabase";

export interface CreateOrderData {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  city: string;
  branch: string;
  payment_method: string;
  total_amount: number;
  items: {
    product_id: string | null;
    product_name?: string;
    product_price?: number;
    quantity: number;
    price: number;
  }[];
}

export class OrderService {
  // Create new order with items
  static async createOrder(
    orderData: CreateOrderData
  ): Promise<OrderWithItems> {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          city: orderData.city,
          branch: orderData.branch,
          payment_method: orderData.payment_method,
          total_amount: orderData.total_amount,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    // Create order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name || "Unknown Product",
      product_price: item.product_price || item.price,
      quantity: item.quantity,
      price: item.price,
    }));

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)
      .select("*");

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw new Error("Failed to create order items");
    }

    return {
      ...order,
      order_items: items || [],
    };
  }

  // Get order by ID with items
  static async getOrderById(id: string): Promise<OrderWithItems | null> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return null;
    }

    return data;
  }

  // Get all orders
  static async getAllOrders(): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      throw new Error("Failed to fetch orders");
    }

    return data || [];
  }

  // Update order status
  static async updateOrderStatus(
    id: string,
    status: Order["status"]
  ): Promise<Order> {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      throw new Error("Failed to update order status");
    }

    return data;
  }

  // Get orders by status
  static async getOrdersByStatus(
    status: Order["status"]
  ): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*)
      `
      )
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders by status:", error);
      throw new Error("Failed to fetch orders by status");
    }

    return data || [];
  }

  // Delete order (and its items due to cascade)
  static async deleteOrder(id: string): Promise<void> {
    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) {
      console.error("Error deleting order:", error);
      throw new Error("Failed to delete order");
    }
  }

  // Get order statistics
  static async getOrderStats(): Promise<{
    total_orders: number;
    pending_orders: number;
    confirmed_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    total_revenue: number;
  }> {
    const { data, error } = await supabase
      .from("orders")
      .select("status, total_amount");

    if (error) {
      console.error("Error fetching order stats:", error);
      throw new Error("Failed to fetch order stats");
    }

    const stats = {
      total_orders: data?.length || 0,
      pending_orders: 0,
      confirmed_orders: 0,
      shipped_orders: 0,
      delivered_orders: 0,
      total_revenue: 0,
    };

    data?.forEach((order) => {
      stats[`${order.status}_orders` as keyof typeof stats]++;
      if (order.status === "delivered") {
        stats.total_revenue += order.total_amount;
      }
    });

    return stats;
  }
}
