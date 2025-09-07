import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Normalize payment method values to "cod" or "online" for UI logic */
export function normalizePaymentMethod(pm?: string | null) {
  if (!pm) return "cod";
  const v = pm.toLowerCase();
  if (v === "online" || v === "card") return "online";
  return "cod";
}

/** Load order + items (items come from order_items, not from orders) */
export async function getOrderWithItems(orderId: string) {
  // 1) Base order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_email, customer_phone, city, branch, status, payment_method, total_amount, created_at, updated_at"
    )
    .eq("id", orderId)
    .single();

  if (orderErr) return { error: orderErr, order: null };

  // 2) Items (handle price vs product_price)
  // We will fetch both columns and map with COALESCE at runtime.
  const { data: itemsRaw, error: itemsErr } = await supabase
    .from("order_items")
    .select("id, product_name, quantity, price, product_price")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  const items = (itemsRaw ?? []).map((i) => {
    const unitPrice = (i as any).product_price ?? (i as any).price ?? 0;
    return {
      id: i.id,
      product_name: i.product_name,
      quantity: i.quantity,
      price: Number(unitPrice),
      subtotal: Number(unitPrice) * Number(i.quantity),
    };
  });

  const pm = normalizePaymentMethod(order.payment_method);

  return {
    order: {
      ...order,
      payment_method: pm,
      items,
    },
    error: itemsErr || null,
  };
}

/** Create order + items for COD */
export async function createCodOrder(payload: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  city?: string;
  branch?: string;
  items: Array<{
    product_id?: string;
    product_name: string;
    price: number;
    quantity: number;
  }>;
  total_amount: number;
}) {
  // Create order
  const { data: orderData, error: orderErr } = await supabase
    .from("orders")
    .insert([
      {
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone ?? null,
        city: payload.city ?? null,
        branch: payload.branch ?? null,
        status: "pending",
        payment_method: "cod",
        total_amount: payload.total_amount,
      },
    ])
    .select()
    .single();

  if (orderErr) return { error: orderErr, order: null };

  // Insert items (support both price column names)
  const itemsInsert = payload.items.map((it) => ({
    order_id: orderData.id,
    product_id: it.product_id ?? null,
    product_name: it.product_name,
    price: it.price, // if column "price" exists it will be used; Supabase will ignore extra fields if not present
    product_price: it.price, // if only "product_price" exists, it will be used
    quantity: it.quantity,
  }));

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(itemsInsert);
  if (itemsErr) return { error: itemsErr, order: null };

  return { order: orderData, error: null };
}

/** Create order + items for online payment */
export async function createOnlineOrder(payload: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  city?: string;
  branch?: string;
  items: Array<{
    product_id?: string;
    product_name: string;
    price: number;
    quantity: number;
  }>;
  total_amount: number;
}) {
  // Create order
  const { data: orderData, error: orderErr } = await supabase
    .from("orders")
    .insert([
      {
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone ?? null,
        city: payload.city ?? null,
        branch: payload.branch ?? null,
        status: "pending",
        payment_method: "online",
        total_amount: payload.total_amount,
      },
    ])
    .select()
    .single();

  if (orderErr) return { error: orderErr, order: null };

  // Insert items (support both price column names)
  const itemsInsert = payload.items.map((it) => ({
    order_id: orderData.id,
    product_id: it.product_id ?? null,
    product_name: it.product_name,
    price: it.price, // if column "price" exists it will be used; Supabase will ignore extra fields if not present
    product_price: it.price, // if only "product_price" exists, it will be used
    quantity: it.quantity,
  }));

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(itemsInsert);
  if (itemsErr) return { error: itemsErr, order: null };

  return { order: orderData, error: null };
}

/** Update order status */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  additionalData?: Record<string, any>
) {
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...additionalData,
    })
    .eq("id", orderId);

  return { error };
}

/** Create cart clearing event */
export async function createCartClearingEvent(orderId: string) {
  const { error } = await supabase.from("cart_clearing_events").insert({
    order_id: orderId,
    created_at: new Date().toISOString(),
  });

  return { error };
}

/** Check if cart should be cleared */
export async function shouldClearCart(orderId: string) {
  const { data, error } = await supabase
    .from("cart_clearing_events")
    .select("*")
    .eq("order_id", orderId)
    .single();

  return { shouldClear: !!data, error };
}
