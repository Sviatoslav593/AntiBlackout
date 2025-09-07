"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DebugOrderStatusPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testOrderNumber = "ce4b2e64-3203-4cef-9d9e-37c13967e37b";

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    const tests = [
      {
        name: "Тест 1: Перевірка базового роутингу",
        url: "/order-status/test-basic",
        description: "Перевіряє чи працює базовий роутинг для order-status",
      },
      {
        name: "Тест 2: Перевірка з UUID",
        url: `/order-status/${testOrderNumber}`,
        description: "Перевіряє чи працює роутинг з реальним UUID",
      },
      {
        name: "Тест 3: Перевірка 404 для неіснуючого замовлення",
        url: "/order-status/non-existent-order",
        description: "Перевіряє чи правильно обробляється 404",
      },
      {
        name: "Тест 4: Перевірка API order/get",
        url: "/api/order/get?orderId=test",
        description: "Перевіряє чи працює API для отримання замовлення",
      },
    ];

    const results = [];

    for (const test of tests) {
      try {
        console.log(`🧪 Running test: ${test.name}`);

        const response = await fetch(test.url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = {
          name: test.name,
          url: test.url,
          description: test.description,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          timestamp: new Date().toISOString(),
          headers: Object.fromEntries(response.headers.entries()),
        };

        // Якщо це не API запит, спробуємо отримати текст відповіді
        if (!test.url.startsWith("/api/")) {
          try {
            const text = await response.text();
            result.responseText = text.substring(0, 500); // Перші 500 символів
          } catch (e) {
            result.responseText = "Не вдалося прочитати відповідь";
          }
        }

        results.push(result);
        console.log(
          `✅ Test completed: ${test.name} - Status: ${response.status}`
        );
      } catch (error) {
        const result = {
          name: test.name,
          url: test.url,
          description: test.description,
          status: "ERROR",
          statusText: error instanceof Error ? error.message : "Unknown error",
          success: false,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.stack : String(error),
        };
        results.push(result);
        console.error(`❌ Test failed: ${test.name}`, error);
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getStatusBadge = (result: any) => {
    if (result.success) {
      return <Badge className="bg-green-100 text-green-800">✅ Успішно</Badge>;
    } else if (result.status === 404) {
      return <Badge className="bg-yellow-100 text-yellow-800">⚠️ 404</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">❌ Помилка</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Діагностика сторінки статусу замовлення
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              Ця сторінка допоможе діагностувати проблеми з роутингом сторінки
              статусу замовлення.
            </p>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">
                Тестовий номер замовлення:
              </h3>
              <code className="bg-blue-100 px-2 py-1 rounded text-sm">
                {testOrderNumber}
              </code>
            </div>

            <Button onClick={runTests} disabled={isLoading} className="w-full">
              {isLoading ? "🧪 Запуск тестів..." : "🚀 Запустити діагностику"}
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Результати тестів:</h3>

              {testResults.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{result.name}</h4>
                      {getStatusBadge(result)}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {result.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">URL:</span>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                          {result.url}
                        </code>
                      </div>

                      <div>
                        <span className="font-medium">Статус:</span>
                        <span className="ml-2">
                          {result.status} - {result.statusText}
                        </span>
                      </div>

                      <div>
                        <span className="font-medium">Час:</span>
                        <span className="ml-2">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {result.responseText && (
                        <div>
                          <span className="font-medium">Відповідь:</span>
                          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                            {result.responseText}
                          </pre>
                        </div>
                      )}

                      {result.error && (
                        <div>
                          <span className="font-medium text-red-600">
                            Помилка:
                          </span>
                          <pre className="mt-1 p-2 bg-red-50 rounded text-xs overflow-auto max-h-32">
                            {result.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">
              Можливі причини проблеми:
            </h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Сторінка не розгорнута на продакшн сервері</li>
              <li>• Проблема з кешем CDN або браузера</li>
              <li>• Неправильна конфігурація сервера</li>
              <li>• Проблема з Next.js роутингом</li>
              <li>• Домен не налаштований правильно</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
