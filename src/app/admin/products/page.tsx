"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Clock,
} from "lucide-react";

interface ProductStats {
  total: number;
  withExternalId: number;
  withPrice: number;
  inStock: number;
  withImages: number;
}

interface ImportLog {
  id: string;
  success: boolean;
  imported: number;
  updated: number;
  errors: number;
  total_processed: number;
  error_message?: string;
  created_at: string;
}

const AdminProductsPage = () => {
  const supabase = createClient();
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchProductStats(), fetchImportLogs()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStats = async () => {
    try {
      const response = await fetch("/api/products/import");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching product stats:", error);
    }
  };

  const fetchImportLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("import_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching import logs:", error);
      } else {
        setImportLogs(data || []);
      }
    } catch (error) {
      console.error("Error fetching import logs:", error);
    }
  };

  const handleImportProducts = async () => {
    try {
      setActionLoading("import");
      const response = await fetch("/api/products/import", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        alert(
          `Импорт завершен успешно!\nИмпортировано: ${data.details.imported}\nОбновлено: ${data.details.updated}\nОшибок: ${data.details.errors}`
        );
        await fetchData();
      } else {
        alert(`Ошибка импорта: ${data.message}`);
      }
    } catch (error) {
      console.error("Error importing products:", error);
      alert("Ошибка при импорте товаров");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateCategories = async () => {
    try {
      setActionLoading("update-categories");
      const response = await fetch("/api/products/update-categories", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        alert(
          `Оновлення категорій завершено!\nОновлено: ${data.stats.updated}\nВсього перевірено: ${data.stats.total}`
        );
        await fetchData();
      } else {
        alert(`Помилка оновлення: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating categories:", error);
      alert("Помилка при оновленні категорій");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCleanupFakeProducts = async () => {
    if (
      !confirm(
        "Вы уверены, что хотите удалить все фейковые товары? Это действие нельзя отменить."
      )
    ) {
      return;
    }

    try {
      setActionLoading("cleanup");
      const response = await fetch("/api/products/cleanup", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        alert(
          `Очистка завершена!\nУдалено: ${data.stats.deleted}\nОставлено: ${data.stats.kept}`
        );
        await fetchData();
      } else {
        alert(`Ошибка очистки: ${data.message}`);
      }
    } catch (error) {
      console.error("Error cleaning up products:", error);
      alert("Ошибка при очистке товаров");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckFakeProducts = async () => {
    try {
      setActionLoading("check");
      const response = await fetch("/api/products/cleanup");
      const data = await response.json();

      if (data.success) {
        alert(
          `Анализ завершен!\nВсего товаров: ${data.stats.total}\nФейковых: ${data.stats.fake}\nНастоящих: ${data.stats.real}`
        );
      } else {
        alert(`Ошибка анализа: ${data.message}`);
      }
    } catch (error) {
      console.error("Error checking fake products:", error);
      alert("Ошибка при анализе товаров");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Завантаження...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              Управління товарами
            </h1>
            <p className="text-gray-600 mt-2">
              Імпорт та управління товарами з XML фіду
            </p>
          </div>
          <Button
            onClick={fetchData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Оновити
          </Button>
        </div>

        {/* Статистика товарів */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Всього товарів</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Download className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Імпортованих</p>
                    <p className="text-2xl font-bold">{stats.withExternalId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">З ціною</p>
                    <p className="text-2xl font-bold">{stats.withPrice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">В наявності</p>
                    <p className="text-2xl font-bold">{stats.inStock}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">З фото</p>
                    <p className="text-2xl font-bold">{stats.withImages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Дії з товарами */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Імпорт товарів
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Імпортувати товари з XML фіду
              </p>
              <Button
                onClick={handleImportProducts}
                disabled={actionLoading === "import"}
                className="w-full"
              >
                {actionLoading === "import" ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Імпортувати товари
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-600" />
                Оновлення категорій
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Оновити категорії товарів з ID на назви
              </p>
              <Button
                onClick={handleUpdateCategories}
                disabled={actionLoading === "update-categories"}
                variant="outline"
                className="w-full"
              >
                {actionLoading === "update-categories" ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Оновити категорії
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Перевірка фейкових
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Перевірити наявність фейкових товарів
              </p>
              <Button
                onClick={handleCheckFakeProducts}
                disabled={actionLoading === "check"}
                variant="outline"
                className="w-full"
              >
                {actionLoading === "check" ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-2" />
                )}
                Перевірити
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Очистити фейкові
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Видалити всі фейкові товари
              </p>
              <Button
                onClick={handleCleanupFakeProducts}
                disabled={actionLoading === "cleanup"}
                variant="destructive"
                className="w-full"
              >
                {actionLoading === "cleanup" ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Видалити фейкові
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Логи імпорту */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Логи імпорту
            </CardTitle>
          </CardHeader>
          <CardContent>
            {importLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Логи імпорту відсутні
              </p>
            ) : (
              <div className="space-y-3">
                {importLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {log.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {log.success ? "Успішний імпорт" : "Помилка імпорту"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(log.created_at).toLocaleString("uk-UA")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {log.success && (
                        <>
                          <Badge variant="outline" className="text-green-600">
                            +{log.imported}
                          </Badge>
                          <Badge variant="outline" className="text-blue-600">
                            ~{log.updated}
                          </Badge>
                          {log.errors > 0 && (
                            <Badge variant="outline" className="text-red-600">
                              !{log.errors}
                            </Badge>
                          )}
                        </>
                      )}
                      {!log.success && log.error_message && (
                        <p className="text-red-600 text-xs max-w-xs truncate">
                          {log.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminProductsPage;
