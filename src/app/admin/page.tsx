import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  BarChart3,
  Settings,
  Users,
  ShoppingCart,
  Mail,
} from "lucide-react";

export default function AdminDashboard() {
  const adminCards = [
    {
      title: "Замовлення",
      description: "Управління замовленнями та статусами",
      href: "/admin/orders",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Статистика",
      description: "Аналітика та звіти по продажах",
      href: "/admin/stats",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Клієнти",
      description: "Управління клієнтською базою",
      href: "/admin/customers",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Товари",
      description: "Управління каталогом товарів",
      href: "/admin/products",
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "Email",
      description: "Налаштування email повідомлень",
      href: "/admin/email",
      icon: Mail,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      title: "Налаштування",
      description: "Загальні налаштування системи",
      href: "/admin/settings",
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Адмін-панель Antiblackout
        </h1>
        <p className="text-gray-600">
          Управління інтернет-магазином та замовленнями
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card
                className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-2 ${card.borderColor} hover:scale-105`}
              >
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <CardTitle className="text-xl text-gray-900">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          🚀 Швидкий доступ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Package className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Переглянути всі замовлення</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Package className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Повернутися на сайт</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
