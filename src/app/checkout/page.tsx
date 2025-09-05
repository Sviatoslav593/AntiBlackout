"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Loader2, CreditCard, Truck, Package } from "lucide-react";
import Link from "next/link";
import CityAutocomplete from "@/components/CityAutocomplete";
import WarehouseAutocomplete from "@/components/WarehouseAutocomplete";
import { NovaPoshtaCity, NovaPoshtaWarehouse } from "@/services/novaPoshtaApi";

type PaymentMethod = "online" | "cash_on_delivery";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  paymentMethod: PaymentMethod | "";
  city: NovaPoshtaCity | null;
  warehouse: NovaPoshtaWarehouse | null;
  customAddress: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  paymentMethod?: string;
  city?: string;
  warehouse?: string;
}

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "+380",
    paymentMethod: "",
    city: null,
    warehouse: null,
    customAddress: "",
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

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Ім'я є обов'язковим полем";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Ім'я повинно містити мінімум 2 символи";
    } else if (formData.firstName.trim().length > 30) {
      newErrors.firstName = "Ім'я не повинно перевищувати 30 символів";
    } else if (!/^[а-яА-ЯёЁa-zA-Z'`'-]+$/u.test(formData.firstName.trim())) {
      newErrors.firstName =
        "Ім'я може містити тільки літери, апострофи та дефіси";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Прізвище є обов'язковим полем";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Прізвище повинно містити мінімум 2 символи";
    } else if (formData.lastName.trim().length > 30) {
      newErrors.lastName = "Прізвище не повинно перевищувати 30 символів";
    } else if (!/^[а-яА-ЯёЁa-zA-Z'`'-]+$/u.test(formData.lastName.trim())) {
      newErrors.lastName =
        "Прізвище може містити тільки літери, апострофи та дефіси";
    }

    // Phone validation (Ukrainian format)
    const phoneRegex = /^\+380\d{9}$/;
    const phoneNumber = formData.phone.trim();

    if (!phoneNumber) {
      newErrors.phone = "Номер телефону є обов'язковим";
    } else if (!phoneNumber.startsWith("+380")) {
      newErrors.phone = "Номер повинен починатися з +380";
    } else if (phoneNumber.length !== 13) {
      newErrors.phone = "Номер повинен містити 13 символів (+380XXXXXXXXX)";
    } else if (!phoneRegex.test(phoneNumber)) {
      newErrors.phone = "Неправильний формат. Приклад: +380671234567";
    } else if (phoneNumber === "+380") {
      newErrors.phone = "Введіть повний номер телефону";
    }

    // Payment method validation
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Будь ласка, оберіть спосіб оплати";
    }

    // City validation
    if (!formData.city) {
      newErrors.city = "Будь ласка, оберіть населений пункт";
    }

    // Warehouse validation
    if (!formData.warehouse && !formData.customAddress.trim()) {
      newErrors.warehouse =
        "Будь ласка, оберіть відділення або введіть адресу доставки";
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
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.warehouse
            ? getWarehouseDisplayName(formData.warehouse)
            : formData.customAddress || "",
          paymentMethod: formData.paymentMethod,
          city: formData.city?.Description || "",
          cityRef: formData.city?.Ref || "",
          warehouse: formData.warehouse
            ? getWarehouseDisplayName(formData.warehouse)
            : formData.customAddress || "",
          warehouseRef: formData.warehouse?.Ref || "",
          customAddress: formData.customAddress || "",
        },
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
        orderDate: new Date().toISOString(),
      };

      console.log("📤 Sending order data:", orderData);

      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      console.log("📥 Response status:", response.status);

      if (response.ok) {
        const responseData = await response.json();
        const orderNumber =
          responseData.orderId || `AB-${Date.now().toString().slice(-10)}`;

        // Prepare data for order success page
        const orderSuccessData = {
          items: state.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          customerInfo: {
            name: `${formData.firstName} ${formData.lastName}`,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            address: `${formData.city?.Description || ""}, ${
              formData.warehouse
                ? `Відділення №${formData.warehouse.Number}`
                : formData.customAddress || ""
            }`,
            email: "", // Add email if collected in future
            paymentMethod: formData.paymentMethod,
            city: formData.city?.Description || "",
            warehouse: formData.warehouse
              ? getWarehouseDisplayName(formData.warehouse)
              : "",
          },
        };

        clearCart();

        // Encode data for URL
        const encodedData = encodeURIComponent(
          JSON.stringify(orderSuccessData)
        );
        router.push(
          `/order-success?orderData=${encodedData}&orderNumber=${orderNumber}`
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Order submission failed:", response.status, errorData);
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Помилка при оформленні замовлення. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get proper warehouse display name with address
  const getWarehouseDisplayName = (warehouse: NovaPoshtaWarehouse): string => {
    const type = warehouse.TypeOfWarehouse?.toLowerCase() || "";
    const address = warehouse.ShortAddress || warehouse.Description || "";

    // Check if it's a postomat (поштомат)
    if (
      type.includes("поштомат") ||
      type.includes("postomat") ||
      type.includes("postal") ||
      warehouse.Description?.toLowerCase().includes("поштомат") ||
      warehouse.DescriptionRu?.toLowerCase().includes("поштомат")
    ) {
      return `Поштомат №${warehouse.Number}${address ? `: ${address}` : ""}`;
    }

    // Default to branch (відділення)
    return `Відділення №${warehouse.Number}${address ? `: ${address}` : ""}`;
  };

  // Validate individual field
  const validateField = (
    field: keyof FormData,
    value: string,
    showEmptyError = false
  ) => {
    const newErrors: FormErrors = {};

    if (field === "firstName") {
      if (!value.trim()) {
        if (showEmptyError) {
          newErrors.firstName = "Ім'я є обов'язковим полем";
        }
      } else if (value.trim().length < 2) {
        newErrors.firstName = "Ім'я повинно містити мінімум 2 символи";
      } else if (value.trim().length > 30) {
        newErrors.firstName = "Ім'я не повинно перевищувати 30 символів";
      } else if (!/^[а-яА-ЯёЁa-zA-Z'`'-]+$/u.test(value.trim())) {
        newErrors.firstName =
          "Ім'я може містити тільки літери, апострофи та дефіси";
      }
    }

    if (field === "lastName") {
      if (!value.trim()) {
        if (showEmptyError) {
          newErrors.lastName = "Прізвище є обов'язковим полем";
        }
      } else if (value.trim().length < 2) {
        newErrors.lastName = "Прізвище повинно містити мінімум 2 символи";
      } else if (value.trim().length > 30) {
        newErrors.lastName = "Прізвище не повинно перевищувати 30 символів";
      } else if (!/^[а-яА-ЯёЁa-zA-Z'`'-]+$/u.test(value.trim())) {
        newErrors.lastName =
          "Прізвище може містити тільки літери, апострофи та дефіси";
      }
    }

    if (field === "phone") {
      const phoneRegex = /^\+380\d{9}$/;
      if (!value.trim()) {
        if (showEmptyError) {
          newErrors.phone = "Номер телефону є обов'язковим";
        }
      } else if (!value.startsWith("+380")) {
        newErrors.phone = "Номер повинен починатися з +380";
      } else if (value.length !== 13) {
        newErrors.phone = "Номер повинен містити 13 символів (+380XXXXXXXXX)";
      } else if (!phoneRegex.test(value)) {
        newErrors.phone = "Неправильний формат. Приклад: +380671234567";
      }
    }

    // Update errors for this field only
    setErrors((prev) => ({
      ...prev,
      ...newErrors,
    }));

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Special handling for phone field
      if (field === "phone") {
        // Ensure +380 prefix is always present
        if (!value.startsWith("+380")) {
          value = "+380";
        }
        // Limit to 13 characters (+380XXXXXXXXX)
        if (value.length > 13) {
          value = value.slice(0, 13);
        }
        // Only allow digits after +380
        const digitsAfter380 = value.slice(4);
        if (digitsAfter380 && !/^\d*$/.test(digitsAfter380)) {
          return; // Don't update if non-digits are entered
        }
      }

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Validate field in real-time (don't show empty errors while typing)
      validateField(field, value, false);
    };

  // Handle phone input key events
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const selectionStart = input.selectionStart || 0;

    // Prevent deletion of +380 prefix
    if ((e.key === "Backspace" || e.key === "Delete") && selectionStart <= 4) {
      e.preventDefault();
      // Move cursor to position after +380
      setTimeout(() => {
        input.setSelectionRange(4, 4);
      }, 0);
    }

    // Only allow digits after +380
    if (selectionStart >= 4) {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ];
      if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    }
  };

  const isFormValid =
    formData.firstName.trim().length >= 2 &&
    formData.firstName.trim().length <= 30 &&
    /^[а-яА-ЯёЁa-zA-Z'`'-]+$/u.test(formData.firstName.trim()) &&
    formData.lastName.trim().length >= 2 &&
    formData.lastName.trim().length <= 30 &&
    /^[а-яА-ЯёЁa-zA-Z'`'-]+$/u.test(formData.lastName.trim()) &&
    /^\+380\d{9}$/.test(formData.phone) &&
    formData.paymentMethod !== "" &&
    formData.city !== null &&
    (formData.warehouse !== null || formData.customAddress.trim().length > 0);

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">
            Оформлення замовлення
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Контактні дані</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="firstName"
                          className="text-sm font-medium"
                        >
                          Ім'я *
                        </label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Введіть ваше ім'я"
                          value={formData.firstName}
                          onChange={handleInputChange("firstName")}
                          onBlur={() =>
                            validateField("firstName", formData.firstName, true)
                          }
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-500">
                            {errors.firstName}
                          </p>
                        )}
                        {!errors.firstName && (
                          <p className="text-xs text-muted-foreground">
                            Введіть ваше ім'я (2-30 символів)
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="lastName"
                          className="text-sm font-medium"
                        >
                          Прізвище *
                        </label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Введіть ваше прізвище"
                          value={formData.lastName}
                          onChange={handleInputChange("lastName")}
                          onBlur={() =>
                            validateField("lastName", formData.lastName, true)
                          }
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-500">
                            {errors.lastName}
                          </p>
                        )}
                        {!errors.lastName && (
                          <p className="text-xs text-muted-foreground">
                            Введіть ваше прізвище (2-30 символів)
                          </p>
                        )}
                      </div>
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
                        onKeyDown={handlePhoneKeyDown}
                        onBlur={() =>
                          validateField("phone", formData.phone, true)
                        }
                        className={errors.phone ? "border-red-500" : ""}
                        maxLength={13}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone}</p>
                      )}
                      {!errors.phone &&
                        formData.phone.length > 4 &&
                        formData.phone.length < 13 && (
                          <p className="text-xs text-muted-foreground">
                            Залишилось {13 - formData.phone.length} цифр
                          </p>
                        )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Спосіб оплати
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="payment-online"
                        name="paymentMethod"
                        value="online"
                        checked={formData.paymentMethod === "online"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            paymentMethod: e.target.value as PaymentMethod,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                      />
                      <label
                        htmlFor="payment-online"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">
                            Оплата карткою онлайн
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Безпечна оплата через LiqPay, Fondy або WayForPay
                        </p>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="payment-cash"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === "cash_on_delivery"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            paymentMethod: e.target.value as PaymentMethod,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                      />
                      <label
                        htmlFor="payment-cash"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            Післяплата (оплата при отриманні)
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Оплата готівкою або карткою при отриманні товару
                        </p>
                      </label>
                    </div>
                  </div>
                  {errors.paymentMethod && (
                    <p className="text-sm text-red-500 mt-2">
                      {errors.paymentMethod}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Доставка
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-900 font-medium">
                        📦 Доставка здійснюється Новою поштою
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Швидка доставка з відправленням в день замовлення по
                        всій Україні
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Населений пункт *
                      </label>
                      <CityAutocomplete
                        value={formData.city?.Description || ""}
                        onChange={(city) => {
                          setFormData((prev) => ({
                            ...prev,
                            city,
                            warehouse: null, // Reset warehouse when city changes
                          }));
                          // Clear errors
                          if (errors.city) {
                            setErrors((prev) => ({ ...prev, city: undefined }));
                          }
                          if (errors.warehouse) {
                            setErrors((prev) => ({
                              ...prev,
                              warehouse: undefined,
                            }));
                          }
                        }}
                        error={errors.city}
                        placeholder="Почніть вводити назву населеного пункту"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Відділення Нової пошти або адреса доставки *
                      </label>
                      <WarehouseAutocomplete
                        cityRef={formData.city?.Ref || null}
                        value={
                          formData.warehouse
                            ? getWarehouseDisplayName(formData.warehouse)
                            : formData.customAddress || ""
                        }
                        onChange={(warehouse, customAddress) => {
                          setFormData((prev) => ({
                            ...prev,
                            warehouse,
                            customAddress: customAddress || "",
                          }));
                          // Clear error
                          if (errors.warehouse) {
                            setErrors((prev) => ({
                              ...prev,
                              warehouse: undefined,
                            }));
                          }
                        }}
                        error={errors.warehouse}
                        placeholder="Введіть номер відділення (напр. 1, 25, 150) або адресу доставки"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleSubmit}
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
                </CardContent>
              </Card>
            </div>

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
