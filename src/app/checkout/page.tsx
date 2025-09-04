"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";

interface FormData {
  name: string;
  phone: string;
  address: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to cart if empty
  if (state.items.length === 0) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="flex justify-center">
              <ShoppingBag className="h-24 w-24 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Кошик порожній</h1>
              <p className="text-muted-foreground text-lg">
                Додайте товари до кошика, щоб оформити замовлення
              </p>
            </div>
            <Link href="/">
              <Button size="lg" className="cursor-pointer">
                Продовжити покупки
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Ім'я є обов'язковим";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Ім'я повинно містити мінімум 2 символи";
    }

    // Phone validation (Ukrainian format)
    const phoneRegex = /^\+380\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Телефон є обов'язковим";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Телефон повинен бути у форматі +380XXXXXXXXX";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Адреса є обов'язковою";
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Адреса повинна містити мінімум 5 символів";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customer: formData,
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
        orderDate: new Date().toISOString(),
      };

      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        clearCart();
        router.push("/order-success");
      } else {
        throw new Error("Failed to submit order");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Помилка при оформленні замовлення. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const isFormValid =
    formData.name.trim().length >= 2 &&
    /^\+380\d{9}$/.test(formData.phone) &&
    formData.address.trim().length >= 5;

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">
            Оформлення замовлення
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <Card>
              <CardHeader>
                <CardTitle>Контактні дані</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Повне ім'я *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Введіть ваше ім'я"
                      value={formData.name}
                      onChange={handleInputChange("name")}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Телефон *
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+380XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleInputChange("phone")}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Адреса доставки *
                    </label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Введіть повну адресу доставки"
                      value={formData.address}
                      onChange={handleInputChange("address")}
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      size="lg"
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Оформлення...
                        </>
                      ) : (
                        "Підтвердити замовлення"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ваше замовлення</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {state.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm leading-tight">
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Кількість: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {item.price * item.quantity} ₴
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Товарів:</span>
                    <span>{state.itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Підсумок:</span>
                    <span>{state.total} ₴</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Доставка:</span>
                    <span className="text-green-600">Безкоштовно</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>До сплати:</span>
                    <span>{state.total} ₴</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  * Швидка доставка з відправленням в день замовлення по всій
                  Україні
                </div>

                <Link href="/cart" className="block">
                  <Button variant="outline" className="w-full cursor-pointer">
                    Повернутися до кошика
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
