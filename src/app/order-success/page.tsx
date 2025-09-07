"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Package,
  Truck,
  Phone,
  User,
  Mail,
  MapPin,
  CreditCard,
  Building,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  city: string;
  branch: string;
  status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  email?: string;
  paymentMethod?: string;
  city?: string;
  warehouse?: string;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const clearCart = () => {
    try {
      localStorage.removeItem("cart");
      console.log("🧹 Cart automatically cleared after successful payment");
      console.log("🧹 Cart after clearing:", localStorage.getItem("cart"));

      // Dispatch custom event to notify other components about cart clearing
      window.dispatchEvent(new CustomEvent("cartCleared"));
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
    }
  };

  const sendOrderEmails = async (orderData: any) => {
    try {
      console.log("📧 Sending order confirmation emails...");

      const response = await fetch("/api/create-order-after-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        console.log("✅ Order confirmation emails sent successfully");
        return true;
      } else {
        console.error("❌ Failed to send order confirmation emails");
        return false;
      }
    } catch (error) {
      console.error("❌ Error sending emails:", error);
      return false;
    }
  };

  const fetchOrderFromAPI = async (orderId: string) => {
    try {
      setIsLoading(true);
      console.log("🔄 Fetching order data for orderId:", orderId);

      // Check if cart should be cleared (from payment callback)
      try {
        const clearResponse = await fetch(
          `/api/check-cart-clearing?orderId=${orderId}`
        );
        if (clearResponse.ok) {
          const clearData = await clearResponse.json();
          if (clearData.shouldClear) {
            console.log("🧹 Cart clearing event detected, clearing cart...");
            clearCart();
          }
        }
      } catch (clearError) {
        console.error("⚠️ Error checking cart clearing:", clearError);
      }

      // First, try to fetch order from database
      try {
        const orderResponse = await fetch(`/api/order/get?orderId=${orderId}`);
        if (orderResponse.ok) {
          const order = await orderResponse.json();
          console.log("📦 Order data loaded from database:", order);

          // Validate order structure
          if (!order || !order.id) {
            throw new Error("Invalid order data received from API");
          }

          // Ensure items array exists and is properly formatted
          const normalizedOrder = {
            ...order,
            items: Array.isArray(order.items) ? order.items : [],
          };

          console.log("📦 Normalized order data:", normalizedOrder);

          // Set order number
          setOrderNumber(normalizedOrder.id);

          // Set order data
          setOrder(normalizedOrder);

          // Set customer info
          setCustomerInfo({
            name: normalizedOrder.customer_name || "Unknown Customer",
            phone: normalizedOrder.customer_phone || "",
            address: normalizedOrder.branch || "",
            email: normalizedOrder.customer_email || "",
            paymentMethod:
              normalizedOrder.payment_method === "online"
                ? "online"
                : "cash_on_delivery",
            city: normalizedOrder.city || "",
            warehouse: normalizedOrder.branch || "",
          });

          // Clear cart after successful order (if not already cleared)
          clearCart();

          // Don't send emails here - they should be sent by payment callback
          console.log("📧 Emails should have been sent by payment callback");

          return; // Exit early if we got data from database
        } else {
          console.error("❌ Order response not ok:", orderResponse.status);
        }
      } catch (dbError) {
        console.error("⚠️ Error fetching order from database:", dbError);
      }

      // Fallback: try to get data from localStorage
      const storedOrderData = localStorage.getItem(`pending_order_${orderId}`);
      if (storedOrderData) {
        try {
          const orderData = JSON.parse(storedOrderData);
          console.log(
            "📥 Using stored order data from localStorage:",
            orderData
          );

          // Set order number
          setOrderNumber(orderId);

          // Convert order items to the expected format
          const items: OrderItem[] =
            orderData.items?.map((item: any) => ({
              id: item.id || 0,
              product_name: item.name || "Unknown Product",
              price: item.price || 0,
              quantity: item.quantity || 1,
              subtotal: (item.price || 0) * (item.quantity || 1),
            })) || [];

          setOrderItems(items);

          // Set customer info
          setCustomerInfo({
            name: orderData.customerData?.name || "Unknown Customer",
            phone: orderData.customerData?.phone || "",
            address: orderData.customerData?.address || "",
            email: orderData.customerData?.email || "",
            paymentMethod: orderData.customerData?.paymentMethod || "online",
            city: orderData.customerData?.city || "",
            warehouse: orderData.customerData?.warehouse || "",
          });

          // Clear cart after successful order (if not already cleared)
          clearCart();

          // Don't send emails here - they should be sent by payment callback
          console.log("📧 Emails should have been sent by payment callback");

          localStorage.removeItem(`pending_order_${orderId}`);
          localStorage.removeItem(`order_${orderId}`);
          console.log("🧹 localStorage cleared:", {
            cart: localStorage.getItem("cart"),
            pendingOrder: localStorage.getItem(`pending_order_${orderId}`),
            order: localStorage.getItem(`order_${orderId}`),
          });
          return;
        } catch (parseError) {
          console.error("Error parsing stored order data:", parseError);
        }
      }

      // If no localStorage data, try API
      console.log("🔄 No localStorage data, trying API...");
      const response = await fetch(`/api/order-success?orderId=${orderId}`);
      const result = await response.json();

      if (result.success && result.order) {
        const order = result.order;
        console.log("📥 Received order data from API:", order);

        // Set order number
        setOrderNumber(order.id);

        // Convert order items to the expected format
        const items: OrderItem[] =
          order.order_items?.map((item: any) => ({
            id: item.id || 0,
            product_name: item.product_name || "Unknown Product",
            price: item.price || 0,
            quantity: item.quantity || 1,
            subtotal: (item.price || 0) * (item.quantity || 1),
          })) || [];

        setOrderItems(items);

        // Set customer info
        setCustomerInfo({
          name: order.customer_name || "Unknown Customer",
          phone: order.customer_phone || "",
          address: order.branch || "",
          email: order.customer_email || "",
          paymentMethod: order.payment_method || "online",
          city: order.city || "",
          warehouse: order.branch || "",
        });

        // Clear cart after successful order (if not already cleared)
        clearCart();

        // Don't send emails here - they should be sent by payment callback
        console.log("📧 Emails should have been sent by payment callback");
      } else {
        console.error("Failed to fetch order data:", result.error);
        loadFallbackData();
      }
    } catch (error) {
      console.error("Error fetching order from API:", error);
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackData = () => {
    console.log("🔄 Loading fallback data...");
    // Generate a sample order number
    setOrderNumber(`AB-${Date.now().toString().slice(-10)}`);
  };

  const calculateTotal = () => {
    if (!order?.items || !Array.isArray(order.items)) {
      return 0;
    }
    return order.items.reduce((total, item) => total + (item.subtotal || item.price), 0);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Завантаження даних замовлення...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Замовлення успішно оформлено!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Дякуємо за ваше замовлення! Ми отримали ваш запит і обробимо його
              найближчим часом.
            </p>
            {orderNumber && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                <p className="text-blue-800 font-medium">
                  Номер замовлення: <span className="font-bold">{orderNumber}</span>
                </p>
              </div>
            )}
          </div>

          {/* Order Details */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Деталі замовлення
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!order?.items || order.items.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No products in this order.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-200 rounded-md flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base truncate">
                          {item.product_name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span>Кількість: {item.quantity}</span>
                          <span>•</span>
                          <span>
                            ₴{(item.price / item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm sm:text-base">
                          ₴{(item.subtotal || item.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Загальна сума:</span>
                  <span className="text-xl font-bold text-blue-600">
                    ₴
                    {order?.total_amount?.toLocaleString() ||
                      calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Інформація про замовника
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ім'я</p>
                    <p className="font-medium">
                      {customerInfo?.name || order?.customer_name || "Не вказано"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <p className="font-medium">
                      {customerInfo?.phone || order?.customer_phone || "Не вказано"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">
                      {customerInfo?.email || order?.customer_email || "Не вказано"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Місто</p>
                    <p className="font-medium">
                      {customerInfo?.city || order?.city || "Не вказано"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Відділення</p>
                    <p className="font-medium">
                      {customerInfo?.warehouse || order?.branch || "Не вказано"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Спосіб оплати</p>
                    <p className="font-medium">
                      {customerInfo?.paymentMethod === "online" ||
                      order?.payment_method === "online"
                        ? "Оплата карткою онлайн"
                        : "Післяплата"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Що далі?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Підтвердження замовлення
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ми надішлемо вам підтвердження на email та SMS з деталями
                      замовлення.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Обробка замовлення
                    </h4>
                    <p className="text-sm text-gray-600">
                      Наші менеджери оброблять ваше замовлення протягом 1-2 робочих
                      днів.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Доставка
                    </h4>
                    <p className="text-sm text-gray-600">
                      Товар буде відправлено на вказану вами адресу через Нову
                      Пошту.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/">
                Продовжити покупки
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/contacts">
                Зв'язатися з нами
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
