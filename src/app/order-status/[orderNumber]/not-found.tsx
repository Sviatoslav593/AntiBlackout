import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function OrderNotFound() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-16 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Замовлення не знайдено
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-gray-600">
                Замовлення з таким номером не існує або було видалено.
              </p>
              <p className="text-sm text-gray-500">
                Перевірте правильність номера замовлення або зверніться до служби підтримки.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  На головну
                </Link>
              </Button>
              
              <Button asChild>
                <Link href="/contacts" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Зв'язатися з нами
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
