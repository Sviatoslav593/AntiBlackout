import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Truck, Phone } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Замовлення оформлено - AntiBlackout",
  description:
    "Ваше замовлення успішно оформлено та буде оброблено найближчим часом",
};

export default function OrderSuccessPage() {
  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-green-600">
              Замовлення оформлено!
            </h1>
            <p className="text-muted-foreground text-lg">
              Дякуємо за ваше замовлення! Ми зв'яжемося з вами найближчим часом
              для підтвердження та уточнення деталей доставки.
            </p>
          </div>

          {/* What's Next */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Package className="h-5 w-5" />
                Що далі?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Підтвердження</h3>
                  <p className="text-sm text-muted-foreground">
                    Протягом 30 хвилин з вами зв'яжеться наш менеджер
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Упаковка</h3>
                  <p className="text-sm text-muted-foreground">
                    Ваше замовлення буде зібрано та упаковано
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Доставка</h3>
                  <p className="text-sm text-muted-foreground">
                    Відправлення в день замовлення по всій Україні
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Info */}
          <div className="bg-blue-50 p-6 rounded-lg space-y-3">
            <h3 className="font-semibold text-blue-900">Важлива інформація:</h3>
            <ul className="text-left space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">
                  Очікуйте дзвінок від нашого менеджера протягом 30 хвилин
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
              <Button size="lg" className="cursor-pointer">
                Продовжити покупки
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="cursor-pointer">
              Зв'язатися з нами
            </Button>
          </div>

          {/* Contact Info */}
          <div className="text-sm text-muted-foreground">
            Маєте питання? Зв'яжіться з нами:
            <br />
            📞 +380 (99) 123-4567 | 📧 support@antiblackout.com
          </div>
        </div>
      </div>
    </Layout>
  );
}
