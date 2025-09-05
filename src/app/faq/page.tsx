"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "Як оформити замовлення?",
    answer:
      "Додайте товар у кошик, перейдіть на сторінку оформлення замовлення, заповніть форму з вашими даними та підтвердьте замовлення.",
  },
  {
    id: 2,
    question: "Які способи оплати доступні?",
    answer:
      "Ми приймаємо оплату банківською карткою, через Apple Pay/Google Pay або безготівковий переказ.",
  },
  {
    id: 3,
    question: "Чи є доставка по всій Україні?",
    answer:
      "Так, ми доставляємо товари у всі регіони України через «Нову Пошту» та інші служби доставки.",
  },
  {
    id: 4,
    question: "Скільки часу займає доставка?",
    answer:
      "Зазвичай доставка займає 1–3 робочих дні залежно від вашого міста.",
  },
  {
    id: 5,
    question: "Чи можу я повернути товар?",
    answer:
      "Так, ви можете повернути товар протягом 14 днів після отримання, якщо він не був у використанні та збережений товарний вигляд.",
  },
  {
    id: 6,
    question: "Як перевірити наявність товару?",
    answer:
      "Усі актуальні залишки відображаються на сайті в режимі реального часу.",
  },
  {
    id: 7,
    question: "Чи є гарантія на продукцію?",
    answer: "Так, ми надаємо офіційну гарантію від виробника на всі товари.",
  },
  {
    id: 8,
    question: "Що робити, якщо товар не підійшов?",
    answer:
      "Зверніться до нашої служби підтримки, і ми допоможемо організувати обмін чи повернення.",
  },
];

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

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
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Часті питання
                </h1>
              </div>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Знайдіть відповіді на найпоширеніші запитання про наші товари,
                замовлення, доставку та гарантії
              </p>
            </motion.section>

            {/* FAQ Accordion */}
            <motion.section
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="divide-y divide-gray-200">
                {faqData.map((item, index) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="group"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-200 hover:bg-gray-50"
                      aria-expanded={openItem === item.id}
                      aria-controls={`faq-answer-${item.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 pr-4">
                          {item.question}
                        </h3>
                        <motion.div
                          animate={{ rotate: openItem === item.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {openItem === item.id && (
                        <motion.div
                          id={`faq-answer-${item.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Contact Support Section */}
            <motion.section
              variants={itemVariants}
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg shadow-lg p-6 sm:p-8 text-center"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
                Не знайшли відповідь?
              </h2>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
                Наша служба підтримки завжди готова допомогти вам
              </p>
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
                <motion.a
                  href="/contacts"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full xs:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  Зв'язатися з нами
                </motion.a>
                <motion.a
                  href="/"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full xs:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                >
                  На головну
                </motion.a>
              </div>
            </motion.section>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
