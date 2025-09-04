'use client'

import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Cart() {
  const { state, updateQuantity, removeItem, clearCart } = useCart()

  if (state.items.length === 0) {
    return (
      <div className="container py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Ваш кошик порожній</h1>
            <p className="text-muted-foreground text-lg">
              Додайте товари до кошика, щоб продовжити покупки
            </p>
          </div>
          <Link href="/">
            <Button size="lg" className="cursor-pointer">
              Продовжити покупки
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">Кошик покупок</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Очистити кошик
            </Button>
          </div>

          <div className="space-y-4">
            {state.items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="relative w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 96px"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                          {item.badge && (
                            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground self-start"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price and Quantity Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold">
                            {item.price} ₴
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {item.originalPrice} ₴
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Всього за товар:
                          </span>
                          <span className="font-bold">
                            {item.price * item.quantity} ₴
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Підсумок замовлення</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Товарів:</span>
                  <span>{state.itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Підсумок:</span>
                  <span>{state.total} ₴</span>
                </div>
                <div className="flex justify-between">
                  <span>Доставка:</span>
                  <span className="text-green-600">Безкоштовно</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>До сплати:</span>
                  <span>{state.total} ₴</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/checkout" className="block">
                  <Button className="w-full cursor-pointer" size="lg">
                    Оформити замовлення
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full cursor-pointer">
                    Продовжити покупки
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Швидка доставка з відправленням в день замовлення по всій Україні
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
