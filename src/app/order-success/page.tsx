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
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
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
        body: JSON.stringify({
          customerData: orderData.customerData,
          items: orderData.items,
          total: orderData.amount,
          orderId: orderData.orderId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Order created and emails sent:", result);
        return true;
      } else {
        console.error("❌ Failed to send emails:", await response.text());
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
        const clearResponse = await fetch(`/api/check-cart-clearing?orderId=${orderId}`);
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

      // First, try to get data from localStorage
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
              name: item.name || "Unknown Product",
              price: item.price || 0,
              quantity: item.quantity || 1,
              image:
                item.image ||
                "https://images.unsplash.com/photo-1609592094914-3ab0e6d1f0f3?w=300&h=300&fit=crop",
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
            name: item.product_name || "Unknown Product",
            price: item.price || 0,
            quantity: item.quantity || 1,
            image:
              "https://images.unsplash.com/photo-1609592094914-3ab0e6d1f0f3?w=300&h=300&fit=crop", // Default image
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

  useEffect(() => {
    // Get order data from URL params or localStorage
    const orderData = searchParams.get("orderData");
    const orderNum = searchParams.get("orderNumber");
    const orderId = searchParams.get("orderId");

    // If we have orderId (from LiqPay redirect), fetch order data from API
    if (orderId) {
      fetchOrderFromAPI(orderId);
      return;
    }

    if (orderData) {
      try {
        // Clear cart when we have orderData (from successful payment)
        clearCart();

        const parsedData = JSON.parse(decodeURIComponent(orderData));
        console.log("📥 Received order success data:", parsedData);
        setOrderItems(parsedData.items || []);
        setCustomerInfo(parsedData.customerInfo || null);
      } catch (error) {
        console.error("Error parsing order data:", error);
        // Try to get data from localStorage as fallback
        const savedOrderData = localStorage.getItem("lastOrderData");
        if (savedOrderData) {
          try {
            const parsedSavedData = JSON.parse(savedOrderData);
            console.log("📥 Using saved order data:", parsedSavedData);
            setOrderItems(parsedSavedData.items || []);
            setCustomerInfo(parsedSavedData.customerInfo || null);
          } catch (savedError) {
            console.error("Error parsing saved order data:", savedError);
            loadFallbackData();
          }
        } else {
          loadFallbackData();
        }
      }
    } else {
      // Try to get data from localStorage
      const savedOrderData = localStorage.getItem("lastOrderData");
      if (savedOrderData) {
        try {
          const parsedSavedData = JSON.parse(savedOrderData);
          console.log("📥 Using saved order data:", parsedSavedData);
          setOrderItems(parsedSavedData.items || []);
          setCustomerInfo(parsedSavedData.customerInfo || null);
        } catch (savedError) {
          console.error("Error parsing saved order data:", savedError);
          loadFallbackData();
        }
      } else {
        loadFallbackData();
      }
    }

    function loadFallbackData() {
      // Fallback to sample data for demonstration
      setOrderItems([
        {
          id: 1,
          name: "Powerbank ANKER 20000mAh",
          price: 2499,
          quantity: 1,
          image:
            "https://images.unsplash.com/photo-1609592094914-3ab0e6d1f0f3?w=300&h=300&fit=crop",
        },
        {
          id: 2,
          name: "Кабель USB-C 2m",
          price: 199,
          quantity: 2,
          image:
            "https://images.unsplash.com/photo-1558618666-5c0c2c7e7985?w=300&h=300&fit=crop",
        },
      ]);
      setCustomerInfo({
        name: "Іван Петренко",
        phone: "+380671234567",
        address: "м. Київ, Відділення №1: вул. Хрещатик, 1",
        email: "ivan@example.com",
        paymentMethod: "cash_on_delivery",
        city: "м. Київ",
        warehouse: "Відділення №1: вул. Хрещатик, 1",
      });
    }

    if (orderNum) {
      setOrderNumber(orderNum);
    } else if (orderData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(orderData));
        setOrderNumber(
          parsedData.orderId || `AB-${Date.now().toString().slice(-10)}`
        );
      } catch {
        setOrderNumber(`AB-${Date.now().toString().slice(-10)}`);
      }
    } else {
      // Generate a sample order number
      setOrderNumber(`AB-${Date.now().toString().slice(-10)}`);
    }
  }, [searchParams]);

  const calculateTotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">
                  Завантаження замовлення...
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Отримуємо дані вашого замовлення
                </p>
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
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">
                Замовлення оформлено!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Номер замовлення:{" "}
                <span className="font-semibold text-foreground">
                  {orderNumber}
                </span>
              </p>
              <p className="text-muted-foreground">
                Дякуємо за ваше замовлення! Ми зв'яжемося з вами найближчим
                часом для підтвердження.
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Order Summary */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Ваше замовлення
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span>Кількість: {item.quantity}</span>
                          <span>•</span>
                          <span>₴{item.price}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm sm:text-base">
                          ₴{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      Загальна сума:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      ₴{calculateTotal().toLocaleString()}
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
                  Інформація про покупця
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customerInfo && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ім'я</p>
                        <p className="font-medium">{customerInfo.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Телефон</p>
                        <p className="font-medium">{customerInfo.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Адреса доставки
                        </p>
                        <p className="font-medium">{customerInfo.address}</p>
                      </div>
                    </div>
                    {customerInfo.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{customerInfo.email}</p>
                        </div>
                      </div>
                    )}
                    {customerInfo.paymentMethod && (
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Спосіб оплати
                          </p>
                          <p className="font-medium">
                            {customerInfo.paymentMethod === "online"
                              ? "Оплата карткою онлайн"
                              : "Післяплата (оплата при отриманні)"}
                          </p>
                        </div>
                      </div>
                    )}
                    {customerInfo.city && (
                      <div className="flex items-start gap-3">
                        <Building className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Населений пункт
                          </p>
                          <p className="font-medium">{customerInfo.city}</p>
                        </div>
                      </div>
                    )}
                    {customerInfo.warehouse && (
                      <div className="flex items-start gap-3">
                        <Package className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Відділення Нової пошти
                          </p>
                          <p className="font-medium">
                            {customerInfo.warehouse}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Process Steps */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-center">Що далі?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Підтвердження</h3>
                    <p className="text-sm text-muted-foreground">
                      Протягом 30 хвилин з вами зв'яжеться наш менеджер
                    </p>
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Упаковка</h3>
                    <p className="text-sm text-muted-foreground">
                      Ваше замовлення буде зібрано та упаковано
                    </p>
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Доставка</h3>
                    <p className="text-sm text-muted-foreground">
                      Відправлення в день замовлення по всій Україні
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">
              Важлива інформація:
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">
                  Очікуйте повідомлення від нашого менеджера протягом 30 хвилин
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">
                  Доставка здійснюється протягом 1-2 робочих днів
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">
                  Оплата при отриманні (готівкою або карткою)
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto cursor-pointer">
                Продовжити покупки
              </Button>
            </Link>
            <Link href="/contacts">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto cursor-pointer"
              >
                Зв'язатися з нами
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="text-center text-sm text-muted-foreground">
            Маєте питання? Зв'яжіться з нами:
            <br />
            📧 antiblackoutsupp@gmail.com | 💬 @antiblackout_support
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Завантаження...</p>
            </div>
          </div>
        </Layout>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
