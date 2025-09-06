"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  User,
  AtSign,
  MessageCircle,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactsPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      content: "antiblackoutsupp@gmail.com",
      link: "mailto:antiblackoutsupp@gmail.com",
      description: "Надішліть нам лист",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Telegram",
      content: "@antiblackout_support",
      link: "https://t.me/antiblackout_support",
      description: "Швидка підтримка в Telegram",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Графік роботи",
      content: "Пн-Нд, з 9:00 до 21:00",
      link: null,
      description: "Ми працюємо щодня",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Адреса",
      content: "вул. Івана Франка, 41, м. Львів",
      link: "https://maps.google.com/?q=вул.+Івана+Франка,+41,+Львів",
      description: "Наш офіс у Львові",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert("Ваше повідомлення успішно надіслане!");

    // Reset form
    setFormData({
      name: "",
      email: "",
      message: "",
    });
    setIsSubmitting(false);
  };

  const isFormValid =
    formData.name.trim() && formData.email.trim() && formData.message.trim();

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
        <div className="container mx-auto px-2 sm:px-4 max-w-6xl">
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
                  <Phone className="h-6 w-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Контакти
                </h1>
              </div>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Зв'яжіться з нами зручним для вас способом. Ми завжди готові
                допомогти!
              </p>
            </motion.section>

            {/* Contact Info Grid */}
            <motion.section variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mr-3">
                        {info.icon}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {info.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {info.description}
                    </p>
                    {info.link ? (
                      <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm sm:text-base font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 cursor-pointer"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-sm sm:text-base font-medium text-gray-900">
                        {info.content}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Contact Form and Map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Contact Form */}
              <motion.section variants={itemVariants}>
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 mr-3">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Напишіть нам
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Ім'я *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Ваше ім'я"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Електронна пошта *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <AtSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Повідомлення *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Ваше повідомлення..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Надсилання...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send className="h-4 w-4 mr-2" />
                          Надіслати повідомлення
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              </motion.section>

              {/* Map Section */}
              <motion.section variants={itemVariants}>
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mr-3">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Як нас знайти
                    </h2>
                  </div>

                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2573.1234567890123!2d24.031233!3d49.841952!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473add7c09109a57%3A0x4223c517012378c6!2z0LLRg9C7LiDQhtCy0LDQvdCwINCk0YDQsNC90LrQsCwgNDEsINCb0YzQstGW0LIsINCb0YzQstGW0LLRgdGM0LrQsCDQvtCx0LvQsNGB0YLRjCwgNzkwMDA!5e0!3m2!1suk!2sua!4v1234567890123!5m2!1suk!2sua"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="AntiBlackout Office Location"
                    ></iframe>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Адреса:</strong> вул. Івана Франка, 41, м. Львів
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Графік:</strong> Пн-Нд, з 9:00 до 21:00
                    </p>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Call to Action */}
            <motion.section
              variants={itemVariants}
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg shadow-lg p-6 sm:p-8 text-center"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
                Потрібна швидка допомога?
              </h2>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
                Зв'яжіться з нами в Telegram для миттєвої підтримки
              </p>
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
                <motion.a
                  href="https://t.me/antiblackout_support"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full xs:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Telegram підтримка
                </motion.a>
                <motion.a
                  href="mailto:antiblackoutsupp@gmail.com"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full xs:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Написати Email
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
