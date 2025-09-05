"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Loader2, CreditCard, Truck, Package } from "lucide-react";
import Link from "next/link";
import CityAutocomplete from "@/components/CityAutocomplete";
import WarehouseAutocomplete from "@/components/WarehouseAutocomplete";
import { NovaPoshtaWarehouse } from "@/services/novaPoshtaApi";
import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import { FormInput } from "@/components/ui/form-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { FormRadioGroup } from "@/components/ui/form-radio-group";
import { CheckoutFormData } from "@/lib/validations";

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const router = useRouter();
  const {
    form,
    formState,
    handlePhoneChange,
    handleCitySelect,
    handleWarehouseSelect,
    handlePaymentMethodChange,
    isFormValid,
    firstName,
    lastName,
    phone,
    email,
    paymentMethod,
    city,
    warehouse,
    customAddress,
  } = useCheckoutForm();

  const { handleSubmit, register, watch, setValue } = form;

  // Redirect to cart if empty
  if (state.items.length === 0) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Кошик порожній</h1>
            <p className="text-muted-foreground mb-6">
              Додайте товари до кошика перед оформленням замовлення
            </p>
            <Link href="/">
              <Button>Повернутися до магазину</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const orderData = {
        customer: {
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          address: data.warehouse
            ? getWarehouseDisplayName(data.warehouse)
            : data.customAddress || "",
          paymentMethod: data.paymentMethod,
          city: data.city?.Description || "",
          cityRef: data.city?.Ref || "",
          warehouse: data.warehouse
            ? getWarehouseDisplayName(data.warehouse)
            : "",
          warehouseRef: data.warehouse?.Ref || "",
          customAddress: data.customAddress || "",
        },
        items: state.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: state.total,
        subtotal: state.total,
        orderDate: new Date().toISOString(),
      };

      console.log("Submitting order:", orderData);

      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Order submitted successfully:", result);

      // Clear cart and redirect to success page
      clearCart();

      // Encode order data for URL
      const orderSuccessData = {
        orderId: result.orderId || Date.now().toString(),
        items: state.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        customerInfo: {
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          address: data.warehouse
            ? getWarehouseDisplayName(data.warehouse)
            : data.customAddress || "",
          paymentMethod: data.paymentMethod,
          city: data.city?.Description || "",
          warehouse: data.warehouse
            ? getWarehouseDisplayName(data.warehouse)
            : "",
        },
        total: state.total,
        subtotal: state.total,
        paymentMethod: data.paymentMethod,
        city: data.city?.Description || "",
        warehouse: data.warehouse
          ? getWarehouseDisplayName(data.warehouse)
          : "",
      };

      const encodedData = encodeURIComponent(JSON.stringify(orderSuccessData));
      console.log("📤 Sending order success data:", orderSuccessData);

      // Save to localStorage as backup
      localStorage.setItem("lastOrderData", JSON.stringify(orderSuccessData));

      router.push(
        `/order-success?orderData=${encodedData}&orderNumber=${orderSuccessData.orderId}`
      );
    } catch (error) {
      console.error("Failed to submit order:", error);
      alert("Помилка при оформленні замовлення. Спробуйте ще раз.");
    }
  };

  // Get proper warehouse display name with address
  const getWarehouseDisplayName = (warehouse: NovaPoshtaWarehouse): string => {
    const type = warehouse.TypeOfWarehouse?.toLowerCase() || "";
    const isPostomat = type.includes("поштомат") || type.includes("postomat");
    const prefix = isPostomat ? "Поштомат" : "Відділення";
    const number = warehouse.Number || "";
    const address = warehouse.ShortAddress || warehouse.Description || "";

    return `${prefix} №${number}: ${address}`;
  };

  const getErrorMessage = (error: any): string => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
      return error.message;
    }
    return "Помилка валідації";
  };

  const paymentOptions = [
    {
      value: "online",
      label: "Оплата карткою онлайн",
      description: "Безпечна оплата через банківську картку",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      value: "cash_on_delivery",
      label: "Післяплата (оплата при отриманні)",
      description: "Оплата готівкою або карткою при отриманні товару",
      icon: <Truck className="h-4 w-4" />,
    },
  ];

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Оформлення замовлення
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Контактні дані</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="Ім'я"
                        placeholder="Введіть ваше ім'я"
                        required
                        hint="Введіть ваше ім'я (2-30 символів)"
                        register={register}
                        name="firstName"
                        error={formState.errors.firstName}
                        value={firstName}
                      />

                      <FormInput
                        label="Прізвище"
                        placeholder="Введіть ваше прізвище"
                        required
                        hint="Введіть ваше прізвище (2-30 символів)"
                        register={register}
                        name="lastName"
                        error={formState.errors.lastName}
                        value={lastName}
                      />
                    </div>

                    <PhoneInput
                      label="Номер телефону"
                      placeholder="+380XXXXXXXXX"
                      required
                      hint="Введіть номер телефону у форматі +380XXXXXXXXX"
                      register={register}
                      name="phone"
                      error={formState.errors.phone}
                      value={phone}
                      onChange={handlePhoneChange}
                    />

                    <FormInput
                      label="Електронна пошта"
                      placeholder="user@example.com"
                      type="email"
                      maxLength={100}
                      hint="Введіть вашу електронну пошту для підтвердження замовлення"
                      register={register}
                      name="email"
                      error={formState.errors.email}
                      value={email}
                    />

                    <Separator className="my-6" />

                    <FormRadioGroup
                      label="Спосіб оплати"
                      required
                      register={register}
                      name="paymentMethod"
                      error={formState.errors.paymentMethod}
                      options={paymentOptions}
                      value={paymentMethod}
                      onChange={handlePaymentMethodChange}
                    />

                    <Separator className="my-6" />

                    <h3 className="text-lg font-semibold mb-4">Доставка</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Доставка здійснюється Новою поштою
                    </p>

                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium">
                        Населений пункт *
                      </label>
                      <CityAutocomplete
                        value={city ? city.Description : ""}
                        onChange={handleCitySelect}
                        placeholder="Введіть назву населеного пункту"
                        error={formState.errors.city?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Відділення Нової пошти *
                      </label>
                      <WarehouseAutocomplete
                        cityRef={city?.Ref || ""}
                        value={
                          warehouse
                            ? getWarehouseDisplayName(warehouse)
                            : customAddress || ""
                        }
                        onChange={handleWarehouseSelect}
                        placeholder="Введіть номер відділення (напр. 1, 25, 150) або адресу доставки"
                      />
                      {formState.errors.warehouse && (
                        <p className="text-sm text-red-500">
                          {getErrorMessage(formState.errors.warehouse)}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full mt-6"
                      size="lg"
                      disabled={formState.isSubmitting}
                    >
                      {formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Оформлення...
                        </>
                      ) : (
                        "Оформити замовлення"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <Card className="h-fit sticky top-24">
              <CardHeader>
                <CardTitle>Ваше замовлення</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded-md"
                            sizes="(max-width: 640px) 64px, 80px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base line-clamp-2">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                          <span>Кількість: {item.quantity}</span>
                          <span>•</span>
                          <span>₴{item.price.toLocaleString()}</span>
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

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Товарів:</span>
                    <span>{state.itemCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Підсумок:</span>
                    <span>₴{state.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Доставка:</span>
                    <span>Безкоштовно</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>До сплати:</span>
                    <span>₴{state.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
