"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { CartDrawer } from "@/components/CartDrawer";

// Test header з fixed positioning
function TestHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { state, isCartAnimating } = useCart();

  const navigation = [
    { name: "Головна", href: "/" },
    { name: "Товари", href: "#products" },
    { name: "Про нас", href: "#about" },
    { name: "Контакти", href: "#contact" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            height: "64px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "32px",
                height: "32px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                backgroundColor: "#2563eb",
                color: "white",
                fontWeight: "bold",
              }}
            >
              AB
            </div>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "#1f2937",
              }}
            >
              AntiBlackout
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            style={{
              display: "none",
              alignItems: "center",
              gap: "2rem",
            }}
            className="md:flex"
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#6b7280",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Cart Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartDrawerOpen(true)}
              style={{
                position: "relative",
                cursor: "pointer",
                minHeight: "44px",
                minWidth: "44px",
              }}
            >
              <motion.div
                animate={
                  isCartAnimating
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, -10, 10, 0],
                      }
                    : {}
                }
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <ShoppingCart style={{ width: "20px", height: "20px" }} />
              </motion.div>
              {state.itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#2563eb",
                    color: "white",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                  }}
                >
                  {state.itemCount}
                </motion.span>
              )}
            </Button>

            <CartDrawer
              isOpen={isCartDrawerOpen}
              onClose={() => setIsCartDrawerOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function FixedTestPage() {
  return (
    <div>
      <TestHeader />

      {/* Main content з padding-top для fixed header */}
      <main style={{ paddingTop: "64px" }}>
        <div style={{ minHeight: "200vh", padding: "20px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
            Fixed Header Test
          </h1>

          <div
            style={{
              padding: "20px",
              backgroundColor: "#fef3c7",
              border: "2px solid #f59e0b",
              borderRadius: "8px",
              marginBottom: "40px",
            }}
          >
            <h2 style={{ color: "#d97706", marginBottom: "10px" }}>
              🧪 Fixed Header Test:
            </h2>
            <p style={{ lineHeight: "1.6" }}>
              Цей header використовує <code>position: fixed</code> замість{" "}
              <code>sticky</code>. Він повинен залишатися зверху при
              прокручуванні.
            </p>
          </div>

          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              style={{
                padding: "30px",
                margin: "20px 0",
                backgroundColor: i % 2 === 0 ? "#f1f5f9" : "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.5rem",
                  color: "#0f172a",
                  marginBottom: "15px",
                }}
              >
                Fixed Test Section {i + 1}
              </h3>
              <p style={{ lineHeight: "1.6", color: "#475569" }}>
                Тестовий контент для перевірки fixed header. Header з position:
                fixed повинен завжди залишатися зверху.
              </p>

              {i % 5 === 0 && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "15px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #ef4444",
                    borderRadius: "6px",
                  }}
                >
                  <strong style={{ color: "#dc2626" }}>
                    🔴 Checkpoint {Math.floor(i / 5) + 1}: Fixed header видно?
                  </strong>
                </div>
              )}
            </div>
          ))}

          <div
            style={{
              padding: "40px",
              backgroundColor: "#ecfdf5",
              border: "2px solid #10b981",
              borderRadius: "12px",
              textAlign: "center",
              marginTop: "40px",
            }}
          >
            <h2
              style={{
                color: "#059669",
                fontSize: "2rem",
                marginBottom: "15px",
              }}
            >
              ✅ Fixed Header Test Complete!
            </h2>
            <p style={{ fontSize: "1.2rem", color: "#047857" }}>
              Якщо header залишався зверху - fixed positioning працює!
            </p>
            <div style={{ marginTop: "20px" }}>
              <Link
                href="/sticky-test"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "8px",
                  marginRight: "10px",
                }}
              >
                Sticky Test
              </Link>
              <Link
                href="/"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "8px",
                }}
              >
                Homepage
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
