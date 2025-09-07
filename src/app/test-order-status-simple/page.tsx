import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TestOrderStatusSimplePage() {
  const testOrderNumber = "ce4b2e64-3203-4cef-9d9e-37c13967e37b";

  // Перевіримо, чи існує замовлення з таким номером
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("order_number", testOrderNumber)
    .single();

  // Перевіримо, чи є взагалі замовлення в базі
  const { data: allOrders, error: allOrdersError } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, customer_name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Діагностика замовлення</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Тестовий номер замовлення:
              </h3>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {testOrderNumber}
              </code>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Результат пошуку замовлення:
              </h3>
              {orderError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <Badge className="bg-red-100 text-red-800 mb-2">
                    ❌ Помилка
                  </Badge>
                  <p className="text-red-700">
                    <strong>Помилка:</strong> {orderError.message}
                  </p>
                  <p className="text-red-700">
                    <strong>Код:</strong> {orderError.code}
                  </p>
                </div>
              ) : order ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <Badge className="bg-green-100 text-green-800 mb-2">
                    ✅ Знайдено
                  </Badge>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>ID:</strong> {order.id}
                    </p>
                    <p>
                      <strong>Номер:</strong> {order.order_number}
                    </p>
                    <p>
                      <strong>Клієнт:</strong> {order.customer_name}
                    </p>
                    <p>
                      <strong>Створено:</strong>{" "}
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                    ⚠️ Не знайдено
                  </Badge>
                  <p className="text-yellow-700">
                    Замовлення з номером {testOrderNumber} не знайдено в базі
                    даних.
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Останні 5 замовлень в базі:
              </h3>
              {allOrdersError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <Badge className="bg-red-100 text-red-800 mb-2">
                    ❌ Помилка
                  </Badge>
                  <p className="text-red-700">
                    <strong>Помилка:</strong> {allOrdersError.message}
                  </p>
                </div>
              ) : allOrders && allOrders.length > 0 ? (
                <div className="space-y-2">
                  {allOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3 bg-gray-50 border rounded"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-gray-600">
                            {order.customer_name}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                    ⚠️ Немає замовлень
                  </Badge>
                  <p className="text-yellow-700">
                    В базі даних немає замовлень.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">
                Рекомендації:
              </h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>
                  • Якщо замовлення не знайдено, створіть тестове замовлення
                </li>
                <li>• Використовуйте реальний номер замовлення з бази даних</li>
                <li>• Перевірте, чи правильно налаштований Supabase</li>
                <li>• Переконайтеся, що таблиця orders існує та має дані</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
