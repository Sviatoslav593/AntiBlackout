"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Loader2, Shield, CheckCircle } from "lucide-react";

interface LiqPayPaymentFormProps {
  amount: number;
  description: string;
  orderId: string;
  onPaymentInitiated?: () => void;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

interface LiqPayResponse {
  success: boolean;
  data?: string;
  signature?: string;
  orderId?: string;
  error?: string;
}

export default function LiqPayPaymentForm({
  amount,
  description,
  orderId,
  onPaymentInitiated,
  onPaymentSuccess,
  onPaymentError,
}: LiqPayPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    data: string;
    signature: string;
  } | null>(null);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      onPaymentInitiated?.();

      // Call our API to get LiqPay data and signature
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description,
          orderId,
          currency: "UAH",
        }),
      });

      const result: LiqPayResponse = await response.json();

      if (!result.success || !result.data || !result.signature) {
        throw new Error(result.error || "Failed to generate payment data");
      }

      setPaymentData({
        data: result.data,
        signature: result.signature,
      });

      // Submit the form to LiqPay
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://www.liqpay.ua/api/3/checkout";
      form.acceptCharset = "utf-8";
      form.style.display = "none";

      const dataInput = document.createElement("input");
      dataInput.type = "hidden";
      dataInput.name = "data";
      dataInput.value = result.data;

      const signatureInput = document.createElement("input");
      signatureInput.type = "hidden";
      signatureInput.name = "signature";
      signatureInput.value = result.signature;

      form.appendChild(dataInput);
      form.appendChild(signatureInput);
      document.body.appendChild(form);
      form.submit();

      console.log("💳 LiqPay payment form submitted for order:", orderId);
    } catch (error) {
      console.error("❌ Error initiating LiqPay payment:", error);
      onPaymentError?.(
        error instanceof Error ? error.message : "Payment initialization failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Оплата карткою онлайн
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Безпечна оплата через LiqPay</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Сума до сплати:</span>
            <span className="font-semibold">{amount.toLocaleString()} ₴</span>
          </div>
          <div className="flex justify-between">
            <span>Номер замовлення:</span>
            <span className="font-mono text-sm">{orderId}</span>
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Підготовка оплати...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Оплатити {amount.toLocaleString()} ₴
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Після натискання кнопки ви будете перенаправлені на сторінку LiqPay</p>
          <p>• Оплата обробляється безпечно через LiqPay</p>
          <p>• Після успішної оплати ви повернетеся на сайт</p>
        </div>

        {paymentData && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Дані для оплати підготовлені
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Перенаправлення на LiqPay...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
