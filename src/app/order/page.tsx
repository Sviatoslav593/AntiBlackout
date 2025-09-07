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

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  product_image?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  city?: string;
  branch?: string;
  status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

function OrderContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearCart = () => {
    try {
      localStorage.removeItem("cart");
      console.log("🧹 Cart cleared");
      // Dispatch custom event to notify other components about cart clearing
      window.dispatchEvent(new CustomEvent("cartCleared"));
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
    }
  };

  const fetchOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔄 Fetching order with ID:", orderId);

      const response = await fetch(`/api/order/get?orderId=${orderId}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch order");
      }

      const orderData = await response.json();
      console.log("📦 Order data loaded:", orderData);

      // Validate order structure
      if (!orderData || !orderData.id) {
        throw new Error("Invalid order data received");
      }

      setOrder(orderData);

      // Clear cart only for online payments with status "paid"
      if (
        orderData.payment_method === "online" &&
        orderData.status === "paid"
      ) {
        console.log("🧹 Online payment confirmed - clearing cart");
        clearCart();
      } else if (orderData.payment_method === "cod") {
        console.log("🧹 COD order - clearing cart immediately");
        clearCart();
      }
    } catch (err) {
      console.error("❌ Error fetching order:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch order");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      setError("Order ID is required");
      setIsLoading(false);
      return;
    }

    // Check if this is a payment callback (return from LiqPay)
    const urlParams = new URLSearchParams(window.location.search);
    const isPaymentCallback = urlParams.get("payment") === "success";

    if (isPaymentCallback) {
      console.log("🔄 Payment callback detected, finalizing order...");
      // Finalize the order after successful payment
      finalizeOrder(orderId);
    } else {
      fetchOrder(orderId);
    }
  }, [searchParams]);

  const finalizeOrder = async (orderId: string) => {
    try {
      // Get order data from localStorage (stored during payment initiation)
      const storedOrderData = localStorage.getItem(`pending_order_${orderId}`);

      if (storedOrderData) {
        const orderData = JSON.parse(storedOrderData);

        // Call finalize API
        const response = await fetch("/api/order/finalize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            customerData: orderData.customerData,
            items: orderData.items,
            totalAmount: orderData.totalAmount,
          }),
        });

        const result = await response.json();

        if (result.success) {
          console.log("✅ Order finalized successfully");
          // Clear stored data
          localStorage.removeItem(`pending_order_${orderId}`);
          localStorage.removeItem(`order_${orderId}`);
        } else {
          console.error("❌ Failed to finalize order:", result.error);
        }
      }

      // Fetch the finalized order
      await fetchOrder(orderId);
    } catch (error) {
      console.error("❌ Error finalizing order:", error);
      // Still fetch the order even if finalization failed
      await fetchOrder(orderId);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Завантаження даних замовлення...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-8 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4">
                Помилка завантаження замовлення
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-2">
                {error}
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/">Повернутися на головну</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container py-8 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4">
                Замовлення не знайдено
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-2">
                Замовлення з таким ID не існує або було видалено.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/">Повернутися на головну</Link>
                </Button>
              </div>
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
              <p className="text-blue-800 font-medium">
                Номер замовлення: <span className="font-bold">{order.id}</span>
              </p>
            </div>
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
              {!order.items || order.items.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No products in this order.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
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
                    ₴{order.total_amount?.toLocaleString() || "0"}
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
                      {order.customer_name || "Не вказано"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Телефон</p>
                    <p className="font-medium">
                      {order.customer_phone || "Не вказано"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">
                      {order.customer_email || "Не вказано"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Місто</p>
                    <p className="font-medium">{order.city || "Не вказано"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Відділення</p>
                    <p className="font-medium">
                      {order.branch || "Не вказано"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Спосіб оплати</p>
                    <p className="font-medium">
                      {order.payment_method === "online"
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
                      Наші менеджери оброблять ваше замовлення протягом 1-2
                      робочих днів.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Доставка</h4>
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
              <Link href="/">Продовжити покупки</Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/contacts">Зв'язатися з нами</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderContent />
    </Suspense>
  );
}
