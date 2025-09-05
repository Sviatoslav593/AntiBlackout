"use client";

import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  Wrench,
  Headphones,
} from "lucide-react";

export default function WarrantyPage() {
  const warrantyIncludes = [
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Виробничі дефекти",
      description: "Дефекти матеріалів і складання, виявлені при виготовленні",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Проблеми з роботою пристрою",
      description:
        "Несправності при нормальному використанні згідно з інструкцією",
    },
  ];

  const warrantyExcludes = [
    {
      icon: <XCircle className="h-5 w-5" />,
      title: "Механічні пошкодження",
      description: "Тріщини, сколи, деформація внаслідок падіння або удару",
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Використання не за призначенням",
      description:
        "Порушення правил експлуатації або використання в екстремальних умовах",
    },
    {
      icon: <Wrench className="h-5 w-5" />,
      title: "Спроби самостійного ремонту",
      description:
        "Розбирання пристрою або ремонт не в авторизованих сервісних центрах",
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
                  <Shield className="h-6 w-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Гарантія
                </h1>
              </div>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Ми гарантуємо якість усіх товарів, що продаються в AntiBlackout
              </p>
            </motion.section>

            {/* Warranty Period */}
            <motion.section variants={itemVariants}>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white mr-3">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Термін гарантії
                  </h2>
                </div>
                <p className="text-center text-base sm:text-lg text-gray-700 font-semibold">
                  Від 6 до 12 місяців залежно від виробника
                </p>
                <p className="text-center text-sm sm:text-base text-gray-600 mt-2">
                  Точний термін гарантії вказується для кожного товару окремо
                </p>
              </div>
            </motion.section>

            {/* What Warranty Covers */}
            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 mr-3">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Що покриває гарантія
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {warrantyIncludes.map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="border border-green-200 bg-green-50 rounded-lg p-4 sm:p-5"
                    >
                      <div className="flex items-center mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white mr-3">
                          {item.icon}
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* What Warranty Doesn't Cover */}
            <motion.section variants={itemVariants}>
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 mr-3">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Що не покриває гарантія
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 sm:gap-4">
                  {warrantyExcludes.map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="border border-red-200 bg-red-50 rounded-lg p-4 sm:p-5"
                    >
                      <div className="flex items-start">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white mr-3 mt-0.5 flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Important Notice */}
            <motion.section variants={itemVariants}>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500 text-white mr-3 mt-0.5 flex-shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      Важливо пам'ятати
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700">
                      Для звернення за гарантійним обслуговуванням обов'язково
                      зберігайте чек або підтвердження замовлення. Гарантія діє
                      тільки за умови дотримання правил експлуатації пристрою.
                    </p>
                  </div>
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
                  Проблеми з товаром?
                </h2>
              </div>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
                Зверніться до нашої служби підтримки для вирішення гарантійних
                питань
              </p>
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
                <motion.a
                  href="/#contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full xs:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  Гарантійний випадок
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
