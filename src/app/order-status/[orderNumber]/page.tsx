"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Package,
  User,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  product_id: string;
  products?: {
    image_url: string | null;
  };
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  city?: string;
  branch?: string;
  payment_method: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export default function OrderStatusPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const supabase = createClient();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrderData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .single();

      if (orderError || !orderData) {
        console.error("Error fetching order:", orderError);
        setError("Замовлення не знайдено");
        return;
      }

      setOrder(orderData);

      // Fetch order items with product images
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
          product_name,
          quantity,
          price,
          product_id,
          products (image_url)
        `
        )
        .eq("order_id", orderData.id);

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
      } else {
        setOrderItems(items || []);
      }
    } catch (err) {
      console.error("Error fetching order data:", err);
      setError("Помилка завантаження даних замовлення");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrderData();
    }
  }, [orderNumber]);

  const handleRefresh = () => {
    fetchOrderData(true);
  };

  // Status styling
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Очікує оплати",
          icon: Clock,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "paid":
        return {
          label: "Оплачено",
          icon: CheckCircle,
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "confirmed":
        return {
          label: "Підтверджено",
          icon: CheckCircle,
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "processing":
        return {
          label: "В обробці",
          icon: Package,
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "shipped":
        return {
          label: "Відправлено",
          icon: Package,
          className: "bg-indigo-100 text-indigo-800 border-indigo-200",
        };
      case "delivered":
        return {
          label: "Доставлено",
          icon: CheckCircle,
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "cancelled":
        return {
          label: "Скасовано",
          icon: XCircle,
          className: "bg-red-100 text-red-800 border-red-200",
        };
      default:
        return {
          label: status,
          icon: Clock,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const getPaymentMethodInfo = (method: string) => {
    switch (method) {
      case "online":
        return {
          label: "Оплата карткою онлайн",
          icon: CreditCard,
          className: "text-blue-600",
        };
      case "cod":
        return {
          label: "Післяплата",
          icon: Package,
          className: "text-green-600",
        };
      default:
        return {
          label: method,
          icon: CreditCard,
          className: "text-gray-600",
        };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Завантаження замовлення...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg border-red-200">
            <CardHeader className="bg-red-500 text-white p-6 rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Package className="w-6 h-6" />
                Помилка завантаження
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <p className="text-lg text-gray-700 mb-4">
                {error || "Замовлення не знайдено"}
              </p>
              <Button
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Спробувати знову
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const paymentInfo = getPaymentMethodInfo(order.payment_method);
  const PaymentIcon = paymentInfo.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Package className="w-6 h-6" />
                  Ваше замовлення #{order.order_number}
                </CardTitle>
                <p className="text-sm opacity-90 mt-1">
                  Дякуємо за ваше замовлення!
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {refreshing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">Оновити</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Badge
                variant="outline"
                className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.className}`}
              >
                <StatusIcon className="w-4 h-4 mr-2" />
                {statusInfo.label}
              </Badge>
              <span className="text-sm text-gray-500">
                Останнє оновлення:{" "}
                {new Date(order.updated_at).toLocaleDateString("uk-UA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700">
                  <User className="w-5 h-5" />
                  Інформація про клієнта
                </h2>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <p>
                      <span className="font-medium">Ім'я:</span>{" "}
                      {order.customer_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {order.customer_email}
                    </p>
                  </div>

                  {order.customer_phone && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <p>
                        <span className="font-medium">Телефон:</span>{" "}
                        {order.customer_phone}
                      </p>
                    </div>
                  )}

                  {order.city && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <p>
                        <span className="font-medium">Місто:</span> {order.city}
                      </p>
                    </div>
                  )}

                  {order.branch && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <p>
                        <span className="font-medium">Відділення:</span>{" "}
                        {order.branch}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700">
                  <Package className="w-5 h-5" />
                  Деталі замовлення
                </h2>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center gap-3">
                    <PaymentIcon
                      className={`w-4 h-4 ${paymentInfo.className}`}
                    />
                    <p>
                      <span className="font-medium">Оплата:</span>{" "}
                      {paymentInfo.label}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Номер замовлення:</span>
                    <span className="font-medium">#{order.order_number}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Статус:</span>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.className}`}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Кількість товарів:</span>
                    <span className="font-medium">
                      {orderItems?.length || 0}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Загальна сума:</span>
                    <span className="text-blue-600">
                      {order.total_amount.toLocaleString()} ₴
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700">
              <Package className="w-5 h-5" />
              Товари в замовленні
            </h2>
            <div className="space-y-4">
              {orderItems?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 border border-gray-200 p-3 rounded-lg shadow-sm"
                >
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.products?.image_url || "/placeholder.jpg"}
                      alt={item.product_name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {item.product_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Кількість: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {item.price.toLocaleString()} ₴
                    </p>
                    <p className="text-sm text-gray-500">
                      {(item.quantity * item.price).toLocaleString()} ₴
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>
                Якщо у вас є питання щодо замовлення, зверніться до нашої служби
                підтримки.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
