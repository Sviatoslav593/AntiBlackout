"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useFavorites } from "@/context/FavoritesContext";
import ProductImageGallery from "@/components/ProductImageGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  ShoppingCart,
  CheckCircle,
  Battery,
  Zap,
  Smartphone,
  ArrowLeft,
  Heart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/utils/supabase/client";
import { generateStructuredData } from "./metadata";

interface Product {
  id: string; // UUID string
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badge?: string;
  capacity: number;
  brand: string;
  popularity: number;
  createdAt: string;
  category: string;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const { addItem, getItemQuantity } = useCart();
  const { showToast } = useToast();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch the specific product by UUID with category join
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select(
            `
            *,
            categories!inner(id, name, parent_id)
          `
          )
          .eq("id", productId)
          .single();

        if (productError || !productData) {
          console.error("Error fetching product:", productError);
          return;
        }

        // Convert to Product format
        const foundProduct: Product = {
          id: productData.id, // UUID string
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price || 0,
          originalPrice: undefined,
          image: productData.image_url || "",
          images: productData.images || [productData.image_url || ""],
          rating: 4.5,
          reviewCount: Math.floor(Math.random() * 100) + 10,
          category: productData.categories?.name || "Uncategorized",
          brand: productData.brand || "Unknown",
          capacity: 0,
          popularity: Math.floor(Math.random() * 100),
          badge: undefined,
          inStock: (productData.quantity || 0) > 0,
          createdAt: productData.created_at || new Date().toISOString(),
        };

        setProduct(foundProduct);

        // Fetch similar products by category_id
        const { data: similarData, error: similarError } = await supabase
          .from("products")
          .select(
            `
            *,
            categories!inner(id, name, parent_id)
          `
          )
          .eq("category_id", productData.category_id)
          .neq("id", productId)
          .gt("quantity", 0)
          .limit(6);

        if (!similarError && similarData) {
          const similar = similarData.map((p) => ({
            id: p.id, // UUID string
            name: p.name || "",
            description: p.description || "",
            price: p.price || 0,
            originalPrice: undefined,
            image: p.image_url || "",
            rating: 4.5,
            reviewCount: Math.floor(Math.random() * 100) + 10,
            category: p.categories?.name || "Uncategorized",
            brand: p.brand || "Unknown",
            capacity: 0,
            popularity: Math.floor(Math.random() * 100),
            badge: undefined,
            inStock: (p.quantity || 0) > 0,
            createdAt: p.created_at || new Date().toISOString(),
          })) as Product[];

          setSimilarProducts(similar);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Завантаження товару...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show not found if product doesn't exist
  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Товар не знайдено
            </h1>
            <p className="text-gray-600 mb-6">
              Запитаний товар не існує або був видалений.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Повернутися до каталогу
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Generate structured data
  const structuredData = product
    ? generateStructuredData(productId.toString())
    : null;

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    // Add multiple quantities if selected
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }

    showToast({
      title: "✅ Товар додано до кошика!",
      description: `${product.name} • Кількість: ${quantity} • ${(
        product.price * quantity
      ).toLocaleString()} ₴`,
      action: {
        label: "Переглянути кошик",
        onClick: () => router.push("/cart"),
      },
    });

    setTimeout(() => setIsAddingToCart(false), 500);
  };

  const handleFavoriteToggle = () => {
    if (!product) return;

    const isCurrentlyFavorite = isFavorite(product.id.toString());

    if (isCurrentlyFavorite) {
      removeFromFavorites(product.id.toString());
      showToast({
        title: "Видалено з обраних",
        description: `${product.name} видалено з обраних товарів`,
      });
    } else {
      addToFavorites(product);
      showToast({
        title: "Додано до обраних!",
        description: `${product.name} додано до обраних товарів`,
        action: {
          label: "Переглянути обрані",
          onClick: () => router.push("/favorites"),
        },
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getSpecifications = (product: Product) => {
    const specs = [
      { label: "Бренд", value: product.brand, icon: Smartphone },
      {
        label: "Категорія",
        value:
          product.category === "powerbank"
            ? "Павербанк"
            : product.category === "charger"
            ? "Зарядка"
            : "Кабель",
        icon: Zap,
      },
    ];

    if (product.capacity > 0) {
      specs.push({
        label: "Ємність",
        value: `${product.capacity.toLocaleString()} мАг`,
        icon: Battery,
      });
    }

    return specs;
  };

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Товар не знайдено
          </h1>
          <Button asChild className="mt-4">
            <Link href="/">Повернутися до каталогу</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const currentQuantityInCart = getItemQuantity(product.id);
  const specifications = getSpecifications(product);

  return (
    <Layout>
      {/* Structured Data */}
      {structuredData && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData.product),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData.breadcrumbs),
            }}
          />
        </>
      )}

      <div className="container py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-muted cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <ProductImageGallery
              images={product.images || [product.image]}
              productName={product.name}
              className="w-full"
            />

            {/* Badge */}
            {product.badge && (
              <Badge
                variant="secondary"
                className="absolute top-4 left-4 bg-blue-600 text-white hover:bg-blue-700"
              >
                {product.badge}
              </Badge>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} відгуків)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {product.price.toLocaleString()} ₴
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {product.originalPrice.toLocaleString()} ₴
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <div className="text-sm text-green-600 font-medium">
                  Економія{" "}
                  {(product.originalPrice - product.price).toLocaleString()} ₴
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    В наявності
                  </span>
                </>
              ) : (
                <>
                  <div className="h-5 w-5 rounded-full bg-red-500" />
                  <span className="text-red-600 font-medium">
                    Немає в наявності
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {isDescriptionExpanded
                  ? product.description
                  : product.description.length > 200
                  ? `${product.description.substring(0, 200)}...`
                  : product.description}
              </p>
              {product.description.length > 200 && (
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                >
                  {isDescriptionExpanded ? "Показати менше" : "Показати більше"}
                </button>
              )}
            </div>

            <Separator />

            {/* Specifications */}
            <div>
              <h3 className="font-semibold mb-3">Характеристики</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <spec.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {spec.label}:
                    </span>
                    <span className="text-sm font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Кількість:
                </label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="cursor-pointer"
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 text-sm font-medium min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="cursor-pointer"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                  className="flex-1 h-12 text-base font-semibold cursor-pointer"
                  size="lg"
                >
                  <motion.div
                    className="flex items-center gap-2"
                    animate={isAddingToCart ? { scale: [1, 0.95, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {isAddingToCart ? "Додається..." : "Додати в кошик"}
                  </motion.div>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleFavoriteToggle}
                  className={`h-12 px-4 cursor-pointer transition-all ${
                    isFavorite(product.id.toString())
                      ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        isFavorite(product.id.toString())
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </motion.div>
                </Button>
              </div>

              {/* Current cart quantity */}
              {currentQuantityInCart > 0 && (
                <div className="text-sm text-muted-foreground">
                  В кошику: {currentQuantityInCart} шт.
                </div>
              )}

              {/* Total price preview */}
              <div className="text-sm text-muted-foreground">
                Загальна вартість:{" "}
                <span className="font-semibold text-foreground">
                  {(product.price * quantity).toLocaleString()} ₴
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Схожі товари</h2>
              <p className="text-muted-foreground">
                Вам також можуть сподобатися ці товари
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct, index) => (
                <motion.div
                  key={similarProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ProductCard product={similarProduct} />
                </motion.div>
              ))}
            </div>

            {/* View All Products Button */}
            <div className="text-center mt-8">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="cursor-pointer"
              >
                <Link href="/">Переглянути всі товари</Link>
              </Button>
            </div>
          </motion.section>
        )}
      </div>
    </Layout>
  );
}
export const dynamic = "force-dynamic";
