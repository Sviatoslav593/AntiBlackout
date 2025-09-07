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
import { localStorageUtils } from "@/lib/localStorage";

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

export default function OrderSuccessContent() {
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

  useEffect(() => {
    if (!searchParams) return;

    const orderId = searchParams.get("orderId");

    if (!orderId) {
      setError("Order ID not found");
      setIsLoading(false);
      return;
    }

    fetchOrder(orderId);
  }, [searchParams]);

  const fetchOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔄 Fetching order with ID:", orderId);

      // Wait 1.5 seconds before fetching to ensure order is created
      await new Promise((r) => setTimeout(r, 1500));

      console.log("🔍 Attempting to fetch order from API...");
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
      console.log("✅ Order loaded from API:", orderData);

      // Validate order structure
      if (!orderData || !orderData.id) {
        throw new Error("Invalid order data received");
      }

      // Log items for debugging
      if (orderData.items) {
        console.log(
          "🖼️ API items with images:",
          orderData.items.map((item: any) => ({
            id: item.id,
            name: item.product_name,
            image: item.product_image,
            hasImage: !!item.product_image,
          }))
        );
      }

      setOrder(orderData);

      // Clear cart for online payments with status "paid"
      if (
        orderData.payment_method === "online" &&
        orderData.status === "paid"
      ) {
        console.log("🧹 Online payment confirmed - clearing cart");
        clearCart();
      }

      // Clear localStorage after successful API fetch
      localStorageUtils.clearPendingOrder();
    } catch (error) {
      console.error("❌ Error fetching order from API:", error);

      // Try to load from localStorage as fallback
      console.log("🔄 Attempting to load order from localStorage...");
      const orderData = localStorageUtils.consumePendingOrder(orderId);

      if (orderData) {
        console.log("✅ Order loaded from localStorage:", orderData);

        // Transform localStorage data to match API format
        const transformedOrder: Order = {
          id: orderData.orderId,
          customer_name: orderData.customerData.name,
          customer_email: orderData.customerData.email,
          customer_phone: orderData.customerData.phone,
          city: orderData.customerData.city,
          branch: orderData.customerData.branch,
          status: "paid", // Assume paid since we're on success page
          payment_method: orderData.paymentMethod,
          total_amount: orderData.totalAmount,
          created_at: orderData.createdAt,
          updated_at: orderData.createdAt,
          items: orderData.items.map((item: any) => {
            console.log("🖼️ Processing item for display:", {
              id: item.id,
              name: item.name,
              image_url: item.image_url,
              hasImage: !!item.image_url,
            });
            return {
              id: item.id,
              product_name: item.name,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.price * item.quantity,
              product_image: item.image_url,
            };
          }),
        };

        setOrder(transformedOrder);
        setError(null);

        // Clear cart for localStorage fallback (online payment)
        console.log("🧹 Online payment fallback - clearing cart");
        clearCart();
      } else {
        console.log("❌ No valid order data in localStorage");
        setError("Failed to load order details");
      }
    } finally {
      setIsLoading(false);
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
    const orderId = searchParams?.get("orderId");

    return (
      <Layout>
        <div className="container py-8 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4">
                Дякуємо за ваше замовлення!
              </h1>
              {orderId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block mt-4">
                  <p className="text-blue-800 font-medium">
                    Номер замовлення:{" "}
                    <span className="font-bold">{orderId}</span>
                  </p>
                </div>
              )}
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
                Ваше замовлення успішно прийнято та обробляється. Детальна
                інформація про замовлення буде надіслана на вашу електронну
                пошту протягом найближчих хвилин.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6 max-w-2xl mx-auto">
                <p className="text-amber-800 text-sm">
                  <strong>Що далі?</strong> Наші менеджери оброблять ваше
                  замовлення протягом 1-2 робочих днів. Ви отримаєте
                  SMS-повідомлення з номером накладної для відстеження доставки.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/">Продовжити покупки</Link>
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/contacts">Зв'язатися з нами</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    const orderId = searchParams?.get("orderId");

    return (
      <Layout>
        <div className="container py-8 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4">
                Дякуємо за ваше замовлення!
              </h1>
              {orderId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block mt-4">
                  <p className="text-blue-800 font-medium">
                    Номер замовлення:{" "}
                    <span className="font-bold">{orderId}</span>
                  </p>
                </div>
              )}
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
                Ваше замовлення успішно прийнято та обробляється. Детальна
                інформація про замовлення буде надіслана на вашу електронну
                пошту протягом найближчих хвилин.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6 max-w-2xl mx-auto">
                <p className="text-amber-800 text-sm">
                  <strong>Що далі?</strong> Наші менеджери оброблять ваше
                  замовлення протягом 1-2 робочих днів. Ви отримаєте
                  SMS-повідомлення з номером накладної для відстеження доставки.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/">Продовжити покупки</Link>
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/contacts">Зв'язатися з нами</Link>
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
