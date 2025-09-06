"use client";

import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Truck,
  Headphones,
  Shield,
  DollarSign,
  Zap,
  Users,
  Heart,
} from "lucide-react";

export default function AboutPage() {
  const advantages = [
    {
      icon: CheckCircle,
      title: "Актуальні залишки товарів",
      description:
        "Завжди актуальна інформація про наявність товарів на складі",
    },
    {
      icon: Truck,
      title: "Швидка доставка по Україні",
      description: "Відправлення в день замовлення по всій території України",
    },
    {
      icon: Headphones,
      title: "Якісна підтримка клієнтів",
      description:
        "Професійна консультація та підтримка на всіх етапах покупки",
    },
    {
      icon: Shield,
      title: "Гарантія на продукцію",
      description: "Офіційна гарантія від виробника на всі товари",
    },
    {
      icon: DollarSign,
      title: "Справедливі ціни",
      description: "Конкурентні ціни без переплат та прихованих комісій",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Про нас
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-16"
          >
            {/* Introduction Section */}
            <motion.section
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Хто ми</h2>
              </div>
              <p className="text-lg leading-relaxed text-gray-700">
                AntiBlackout — це український онлайн-магазин, який працює з 2021
                року. Ми спеціалізуємося на повербанках, зарядних пристроях та
                аксесуарах для безперебійної роботи ваших гаджетів. Наша місія —
                допомогти вам завжди залишатися на зв'язку навіть у
                найскладніших умовах.
              </p>
            </motion.section>

            {/* Mission Section */}
            <motion.section
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <div className="flex items-center mb-6">
                <Heart className="h-8 w-8 text-green-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Наша місія</h2>
              </div>
              <div className="space-y-4">
                <p className="text-lg leading-relaxed text-gray-700">
                  Ми віримо, що кожна людина має право на надійне джерело
                  енергії. Саме тому ми співпрацюємо з перевіреними
                  постачальниками, пропонуємо сертифіковані товари та гарантуємо
                  якість кожного замовлення.
                </p>
                <p className="text-lg leading-relaxed text-gray-700 font-medium">
                  Наші цінності — довіра, надійність та підтримка клієнтів.
                </p>
              </div>
            </motion.section>

            {/* Why Choose Us Section */}
            <motion.section
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm p-8"
            >
              <div className="flex items-center mb-8">
                <Zap className="h-8 w-8 text-yellow-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Чому обирають нас
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {advantages.map((advantage, index) => {
                  const IconComponent = advantage.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {advantage.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {advantage.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* Closing Statement */}
            <motion.section variants={itemVariants} className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 text-white">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <Zap className="h-16 w-16 mx-auto mb-4 opacity-90" />
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    AntiBlackout — ваш надійний партнер у світі енергії
                  </h2>
                  <p className="text-xl opacity-90">
                    Разом ми подолаємо будь-який блекаут.
                  </p>
                </motion.div>
              </div>
            </motion.section>

            {/* Call to Action */}
            <motion.section variants={itemVariants} className="text-center">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Готові зробити замовлення?
                </h3>
                <p className="text-gray-600 mb-6">
                  Переглядайте наш каталог та обирайте найкращі енергетичні
                  рішення
                </p>
                <motion.a
                  href="/"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Переглянути товари
                </motion.a>
              </div>
            </motion.section>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
export const dynamic = "force-dynamic";
