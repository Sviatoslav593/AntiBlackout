import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">
                AntiBlackout
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ваше надійне джерело павербанків, зарядних пристроїв та аварійних
              енергетичних рішень. Залишайтеся на зв'язку, коли це найбільш
              важливо.
            </p>
            <div className="flex space-x-4">
              <a
                href="mailto:antiblackoutsupp@gmail.com"
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://t.me/antiblackout_support"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Швидкі посилання
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 transform duration-200 cursor-pointer"
                >
                  Головна
                </Link>
              </li>
              <li>
                <Link
                  href="/#products"
                  className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 transform duration-200 cursor-pointer"
                >
                  Товари
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 transform duration-200 cursor-pointer"
                >
                  Про нас
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 transform duration-200 cursor-pointer"
                >
                  Контакти
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Підтримка</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 transform duration-200 cursor-pointer"
                >
                  Часті питання
                </Link>
              </li>
              <li>
                <Link
                  href="/delivery"
                  className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 transform duration-200 cursor-pointer"
                >
                  Доставка
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 transform duration-200 cursor-pointer"
                >
                  Повернення
                </Link>
              </li>
              <li>
                <Link
                  href="/warranty"
                  className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 transform duration-200 cursor-pointer"
                >
                  Гарантія
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Контакти</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:antiblackoutsupp@gmail.com"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                  <span>antiblackoutsupp@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/antiblackout_support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>@antiblackout_support</span>
                </a>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>вул. Івана Франка, 41, м. Львів</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} AntiBlackout. Всі права захищені.
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link
                href="#"
                className="hover:text-foreground transition-colors hover:underline cursor-pointer"
              >
                Політика конфіденційності
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors hover:underline cursor-pointer"
              >
                Умови користування
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors hover:underline cursor-pointer"
              >
                Політика cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
