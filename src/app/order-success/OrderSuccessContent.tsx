"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  product_image?: string;
}

export default function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      const response = await fetch(`/api/order/get?orderId=${orderId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }

      const orderData = await response.json();
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження деталей замовлення...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Помилка завантаження
              </h2>
              <p className="text-gray-600 mb-6">
                {error || "Замовлення не знайдено"}
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Повернутися на головну
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Замовлення успішно оформлено!
          </h1>
          <p className="text-lg text-gray-600">
            Дякуємо за ваше замовлення. Ми надішлемо підтвердження на email.
          </p>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Деталі замовлення
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Номер замовлення</p>
                  <p className="font-medium">#{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Статус</p>
                  <p className="font-medium text-green-600 capitalize">
                    {order.status === "paid" ? "Оплачено" : order.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Спосіб оплати</p>
                  <p className="font-medium">
                    {order.payment_method === "online"
                      ? "Картка"
                      : "Накладений платіж"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Загальна сума</p>
                  <p className="font-medium text-lg">
                    ₴{order.total_amount?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Контактна інформація</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Ім'я:</span>{" "}
                    {order.customer_name}
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    {order.customer_email}
                  </p>
                  {order.customer_phone && (
                    <p>
                      <span className="text-gray-500">Телефон:</span>{" "}
                      {order.customer_phone}
                    </p>
                  )}
                  {order.city && (
                    <p>
                      <span className="text-gray-500">Місто:</span> {order.city}
                    </p>
                  )}
                  {order.branch && (
                    <p>
                      <span className="text-gray-500">Відділення:</span>{" "}
                      {order.branch}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Товари в замовленні</CardTitle>
            </CardHeader>
            <CardContent>
              {order.items && order.items.length > 0 ? (
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
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Товари не знайдено
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Продовжити покупки
              </Button>
            </Link>
            <Button onClick={() => window.print()}>
              Роздрукувати замовлення
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
