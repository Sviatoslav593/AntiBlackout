import Link from "next/link";

export default function TestOrderStatusPage() {
  const testOrderNumber = "ce4b2e64-3203-4cef-9d9e-37c13967e37b";
  
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Тест сторінки статусу замовлення</h1>
      
      <div className="space-y-4">
        <p>Тестовий номер замовлення: <code className="bg-gray-100 px-2 py-1 rounded">{testOrderNumber}</code></p>
        
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Посилання для тестування:</h2>
          <ul className="space-y-2">
            <li>
              <Link 
                href={`/order-status/${testOrderNumber}`}
                className="text-blue-600 hover:underline"
              >
                /order-status/{testOrderNumber}
              </Link>
            </li>
            <li>
              <Link 
                href="/order-status/non-existent-order"
                className="text-blue-600 hover:underline"
              >
                /order-status/non-existent-order (тест 404)
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800">Примітка:</h3>
          <p className="text-yellow-700 text-sm">
            Якщо сторінка працює локально, але не працює на продакшні, 
            перевірте чи правильно розгорнута версія на сервері.
          </p>
        </div>
      </div>
    </div>
  );
}
