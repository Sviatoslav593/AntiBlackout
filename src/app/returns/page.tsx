"use client";

import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Package,
  CheckCircle,
  Receipt,
  Headphones,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function ReturnsPage() {
  const returnConditions = [
    {
      icon: <Package className="h-5 w-5" />,
      title: "Товар не був у використанні",
      description:
        "Пристрій має бути в оригінальному стані без слідів використання",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Збережена оригінальна упаковка",
      description: "Упаковка та всі комплектуючі мають бути в наявності",
    },
    {
      icon: <Receipt className="h-5 w-5" />,
      title: "Є чек або підтвердження замовлення",
      description: "Документ, що підтверджує факт покупки товару",
    },
  ];

  const returnSteps = [
    {
      step: "1",
      title: "Зверніться до нашої служби підтримки",
      description: "Повідомте про бажання повернути товар та причину",
    },
    {
      step: "2",
      title: "Відправте товар через «Нову Пошту»",
      description: "Упакуйте товар та відправте на нашу адресу",
    },
    {
      step: "3",
      title: "Отримайте повернення коштів",
      description:
        "Після перевірки товару повернемо кошти протягом 3–5 робочих днів",
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
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Повернення товару
                </h1>
              </div>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Ви можете повернути товар протягом 14 днів після отримання, якщо
                він відповідає умовам повернення
              </p>
            </motion.section>

            {/* Return Period */}
            <motion.section variants={itemVariants}>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white mr-3">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Термін повернення: 14 днів
                  </h2>
                </div>
                <p className="text-center text-sm sm:text-base text-gray-600">
                  Відлік починається з дня отримання товару
                </p>
              </div>
            </motion.section>

            {/* Return Conditions */}
            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Умови повернення
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {returnConditions.map((condition, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 mr-3">
                          {condition.icon}
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                          {condition.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {condition.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Return Process */}
            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Як оформити повернення
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  {returnSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-start space-x-4"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0 mt-1">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600">
                          {step.description}
                        </p>
                      </div>
                      {index < returnSteps.length - 1 && (
                        <div className="hidden sm:flex items-center justify-center w-8 h-8 text-gray-400">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Contact Support */}
            <motion.section
              variants={itemVariants}
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg shadow-lg p-6 sm:p-8 text-center"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white mr-3">
                  <Headphones className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  Потрібна допомога з поверненням?
                </h2>
              </div>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
                Наша служба підтримки допоможе оформити повернення
              </p>
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
                <motion.a
                  href="/#contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full xs:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  Зв'язатися з нами
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
