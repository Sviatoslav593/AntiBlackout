"use client";

import Layout from "@/components/Layout";

export default function StickyTestPage() {
  return (
    <Layout>
      <div style={{ minHeight: "200vh", padding: "20px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
          Sticky Header Test
        </h1>

        <div
          style={{
            padding: "20px",
            backgroundColor: "#f0f9ff",
            border: "2px solid #0ea5e9",
            borderRadius: "8px",
            marginBottom: "40px",
          }}
        >
          <h2 style={{ color: "#0ea5e9", marginBottom: "10px" }}>
            📋 Інструкції для тесту:
          </h2>
          <ol style={{ lineHeight: "1.6" }}>
            <li>
              <strong>Прокрутіть сторінку вниз</strong> - header повинен
              залишитися зверху
            </li>
            <li>
              <strong>Натисніть на cart icon</strong> - має відкритися drawer
            </li>
            <li>
              <strong>Натисніть на мобільне меню</strong> (якщо на телефоні)
            </li>
            <li>
              <strong>Спробуйте навігаційні посилання</strong>
            </li>
          </ol>
        </div>

        {/* Генеруємо багато контенту для тестування скролу */}
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            style={{
              padding: "30px",
              margin: "20px 0",
              backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "1.5rem",
                color: "#1e40af",
                marginBottom: "15px",
              }}
            >
              Секція {i + 1}
            </h3>
            <p style={{ lineHeight: "1.6", color: "#64748b" }}>
              Це тестовий контент для перевірки sticky header. Header повинен
              залишатися зверху при прокручуванні цього довгого контенту. Якщо
              ви бачите header постійно зверху - sticky працює правильно!
            </p>

            {i % 10 === 0 && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "15px",
                  backgroundColor: "#dcfce7",
                  border: "1px solid #16a34a",
                  borderRadius: "6px",
                }}
              >
                <strong style={{ color: "#16a34a" }}>
                  ✅ Checkpoint {Math.floor(i / 10) + 1}: Чи видно header
                  зверху?
                </strong>
              </div>
            )}
          </div>
        ))}

        <div
          style={{
            padding: "40px",
            backgroundColor: "#f0fdf4",
            border: "2px solid #22c55e",
            borderRadius: "12px",
            textAlign: "center",
            marginTop: "40px",
          }}
        >
          <h2
            style={{ color: "#16a34a", fontSize: "2rem", marginBottom: "15px" }}
          >
            🎉 Кінець тесту!
          </h2>
          <p style={{ fontSize: "1.2rem", color: "#15803d" }}>
            Якщо ви дійшли сюди і header все ще видно зверху - sticky
            positioning працює ідеально! 🚀
          </p>
        </div>
      </div>
    </Layout>
  );
}
