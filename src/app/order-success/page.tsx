"use client";

import { useEffect, useState } from "react";
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

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("");

  useEffect(() => {
    // Get order data from URL params or localStorage
    const orderData = searchParams.get("orderData");
    const orderNum = searchParams.get("orderNumber");

    if (orderData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(orderData));
        setOrderItems(parsedData.items || []);
        setCustomerInfo(parsedData.customerInfo || null);
      } catch (error) {
        console.error("Error parsing order data:", error);
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
    }

    if (orderNum) {
      setOrderNumber(orderNum);
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
