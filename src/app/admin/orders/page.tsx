'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  city?: string;
  branch?: string;
  payment_method: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

const AdminOrdersPage = () => {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);
      
      // Оновлюємо статус в базі даних
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        alert('Помилка оновлення статусу замовлення');
        return;
      }

      // Оновлюємо локальний стан
      setOrders((prev) =>
        prev.map((order) => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
            : order
        )
      );

      // Відправляємо email про зміну статусу
      try {
        const response = await fetch('/api/send-status-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: newStatus }),
        });

        if (!response.ok) {
          console.error('Failed to send status email');
        }
      } catch (emailError) {
        console.error('Error sending status email:', emailError);
      }

    } catch (error) {
      console.error('Error updating order:', error);
      alert('Помилка оновлення замовлення');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Очікує оплати',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'paid':
        return {
          label: 'Оплачено',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'confirmed':
        return {
          label: 'Підтверджено',
          icon: CheckCircle,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'processing':
        return {
          label: 'В обробці',
          icon: Package,
          className: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'shipped':
        return {
          label: 'Відправлено',
          icon: Truck,
          className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      case 'delivered':
        return {
          label: 'Доставлено',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'cancelled':
        return {
          label: 'Скасовано',
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          label: status,
          icon: Clock,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const getPaymentMethodInfo = (method: string) => {
    switch (method) {
      case 'online':
        return {
          label: 'Оплата карткою онлайн',
          icon: CreditCard,
          className: 'text-blue-600',
        };
      case 'cod':
        return {
          label: 'Післяплата',
          icon: Package,
          className: 'text-green-600',
        };
      default:
        return {
          label: method,
          icon: CreditCard,
          className: 'text-gray-600',
        };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Завантаження замовлень...</span>
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
              Адмін-панель: Замовлення
            </h1>
            <p className="text-gray-600 mt-2">
              Управління замовленнями та відстеження статусів
            </p>
          </div>
          <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Оновити
          </Button>
        </div>

        <div className="grid gap-6">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Немає замовлень
                </h3>
                <p className="text-gray-600">
                  Поки що немає замовлень для відображення
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const paymentInfo = getPaymentMethodInfo(order.payment_method);
              const StatusIcon = statusInfo.icon;
              const PaymentIcon = paymentInfo.icon;

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-3">
                        <Package className="w-5 h-5 text-blue-600" />
                        Замовлення #{order.order_number}
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.className}`}
                        >
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {statusInfo.label}
                        </Badge>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/order-status/${order.order_number}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Переглянути
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Клієнт</p>
                          <p className="font-medium">{order.customer_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-sm">{order.customer_email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <PaymentIcon className={`w-4 h-4 ${paymentInfo.className}`} />
                        <div>
                          <p className="text-sm text-gray-600">Оплата</p>
                          <p className="font-medium text-sm">{paymentInfo.label}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Дата</p>
                          <p className="font-medium text-sm">
                            {new Date(order.created_at).toLocaleDateString('uk-UA')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm text-gray-600">Сума замовлення</p>
                          <p className="text-xl font-bold text-blue-600">
                            {order.total_amount.toLocaleString()} ₴
                          </p>
                        </div>
                        {order.city && (
                          <div>
                            <p className="text-sm text-gray-600">Місто</p>
                            <p className="font-medium">{order.city}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">
                          Змінити статус:
                        </label>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateStatus(order.id, value)}
                          disabled={updating === order.id}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Очікує оплати</SelectItem>
                            <SelectItem value="paid">Оплачено</SelectItem>
                            <SelectItem value="confirmed">Підтверджено</SelectItem>
                            <SelectItem value="processing">В обробці</SelectItem>
                            <SelectItem value="shipped">Відправлено</SelectItem>
                            <SelectItem value="delivered">Доставлено</SelectItem>
                            <SelectItem value="cancelled">Скасовано</SelectItem>
                          </SelectContent>
                        </Select>
                        {updating === order.id && (
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {orders.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Всього замовлень: {orders.length}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminOrdersPage;
