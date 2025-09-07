import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, User, Mail, MapPin, CreditCard, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface Props {
  params: { orderNumber: string };
}

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  product_id: string;
  products?: {
    image_url: string | null;
  };
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  city: string;
  branch: string;
  payment_method: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export default async function OrderStatusPage({ params }: Props) {
  const supabase = supabaseAdmin;

  // Fetch order by order number
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', params.orderNumber)
    .single();

  if (error || !order) {
    notFound();
  }

  // Fetch order items with product images
  const { data: items } = await supabase
    .from('order_items')
    .select(`
      product_name,
      quantity,
      price,
      product_id,
      products (image_url)
    `)
    .eq('order_id', order.id);

  // Status styling
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
      case 'shipped':
        return {
          label: 'Відправлено',
          icon: Package,
          className: 'bg-purple-100 text-purple-800 border-purple-200',
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

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  // Payment method styling
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

  const paymentInfo = getPaymentMethodInfo(order.payment_method);
  const PaymentIcon = paymentInfo.icon;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Замовлення #{order.order_number}
          </h1>
          <div className="flex items-center gap-4">
            <Badge className={`${statusInfo.className} text-sm font-medium`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusInfo.label}
            </Badge>
            <span className="text-sm text-gray-500">
              Створено: {new Date(order.created_at).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Інформація про замовника
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">Повне ім'я</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{order.customer_email}</p>
                  <p className="text-sm text-gray-500">Email адреса</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{order.city}</p>
                  <p className="text-sm text-gray-500">Місто доставки</p>
                </div>
              </div>
              
              {order.branch && (
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{order.branch}</p>
                    <p className="text-sm text-gray-500">Відділення НП</p>
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="flex items-center gap-3">
                <PaymentIcon className={`w-4 h-4 ${paymentInfo.className}`} />
                <div>
                  <p className="font-medium">{paymentInfo.label}</p>
                  <p className="text-sm text-gray-500">Спосіб оплати</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Підсумок замовлення
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Номер замовлення:</span>
                <span className="font-medium">#{order.order_number}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Статус:</span>
                <Badge className={statusInfo.className}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Кількість товарів:</span>
                <span className="font-medium">{items?.length || 0}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Загальна сума:</span>
                <span className="text-blue-600">{order.total_amount.toLocaleString()} ₴</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Товари в замовленні
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items && items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item: OrderItem, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.products?.image_url || '/placeholder.jpg'}
                        alt={item.product_name}
                        fill
                        className="object-cover rounded-md"
                        sizes="64px"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.product_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID товару: {item.product_id}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {item.quantity} × {item.price.toLocaleString()} ₴
                      </p>
                      <p className="text-sm text-gray-500">
                        = {(item.quantity * item.price).toLocaleString()} ₴
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Товари не знайдені</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Якщо у вас є питання щодо замовлення, зверніться до нашої служби підтримки.
          </p>
        </div>
      </div>
    </Layout>
  );
}
