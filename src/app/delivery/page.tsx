"use client";

import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Truck, Package, Building2, CreditCard } from "lucide-react";

export default function DeliveryPage() {
  const deliveryMethods = [
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Нова Пошта",
      description: "1–3 робочі дні",
      details: "Доставка у відділення Нової Пошти у вашому місті",
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: "Кур'єр Нова Пошта",
      description: "1–3 робочі дні",
      details: "Доставка кур'єром за вказаною адресою",
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Самовивіз із відділення",
      description: "В день замовлення",
      details: "Забрати товар особисто з нашого відділення",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-12 pt-6 sm:pt-8">
        <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
          >
            {/* Header Section */}
            <motion.section variants={itemVariants} className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white mr-3">
                  <Truck className="h-6 w-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Доставка
                </h1>
              </div>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Ми дбаємо про те, щоб ви отримали своє замовлення швидко та
                зручно
              </p>
            </motion.section>

            {/* Delivery Methods */}
            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Способи доставки
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {deliveryMethods.map((method, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mr-3">
                          {method.icon}
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            {method.title}
                          </h3>
                          <p className="text-sm text-blue-600 font-medium">
                            {method.description}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{method.details}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Delivery Cost */}
            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 mr-3">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Вартість доставки
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 mt-0.5">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        При замовленні від 2000 грн — доставка безкоштовна
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Ми покриваємо всі витрати на доставку для великих
                        замовлень
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 mt-0.5">
                      <span className="text-sm font-bold">₴</span>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        При замовленні до 2000 грн — вартість згідно з тарифами
                        перевізника
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Вартість доставки розраховується автоматично при
                        оформленні замовлення
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Additional Info */}
            <motion.section
              variants={itemVariants}
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg shadow-lg p-6 sm:p-8 text-center"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
                Швидка доставка по всій Україні
              </h2>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
                Ми співпрацюємо з найнадійнішими службами доставки
              </p>
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
                <motion.a
                  href="/#products"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full xs:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  Переглянути товари
                </motion.a>
                <motion.a
                  href="/faq"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full xs:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                >
                  Часті питання
                </motion.a>
              </div>
            </motion.section>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
export const dynamic = 'force-dynamic';
