import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Types
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  total_price: number;
  items: OrderItem[];
}

interface Customer {
  email: string;
  name: string;
}

interface RequestData {
  order: Order;
  customer: Customer;
}

// Email template
function createEmailHTML(order: Order, customer: Customer): string {
  const statusText =
    order.status === "pending" ? "Очікує підтвердження" : order.status;

  return `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Підтвердження замовлення</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d3748;
        }
        .order-info {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .order-number {
            font-size: 20px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .status {
            display: inline-block;
            background: #4299e1;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .items-table th {
            background: #4a5568;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        .items-table tr:last-child td {
            border-bottom: none;
        }
        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .total {
            background: #2d3748;
            color: white;
            font-weight: bold;
        }
        .total-row td {
            background: #2d3748;
            color: white;
            font-size: 18px;
            font-weight: bold;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .info-block {
            background: #e6fffa;
            border-left: 4px solid #38b2ac;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .info-block h3 {
            margin-top: 0;
            color: #2d3748;
        }
        .info-block ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .info-block li {
            margin: 8px 0;
        }
        .footer {
            background: #2d3748;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .footer h3 {
            margin-top: 0;
            color: #e2e8f0;
        }
        .contact-info {
            margin: 15px 0;
        }
        .contact-info a {
            color: #90cdf4;
            text-decoration: none;
        }
        .contact-info a:hover {
            text-decoration: underline;
        }
        .thank-you {
            font-size: 16px;
            margin-top: 20px;
            color: #e2e8f0;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .items-table {
                font-size: 14px;
            }
            .items-table th,
            .items-table td {
                padding: 10px 8px;
            }
            .cta-button {
                display: block;
                text-align: center;
                margin: 20px auto;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚡ AntiBlackout</div>
            <p>Ваш надійний постачальник енергії</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Привіт, ${customer.name}! 👋
            </div>
            
            <p>Дякуємо за ваше замовлення! Ми отримали ваш запит і вже працюємо над його обробкою.</p>
            
            <div class="order-info">
                <div class="order-number">Замовлення №${order.id}</div>
                <span class="status">${statusText}</span>
            </div>
            
            <h3>Деталі замовлення:</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Товар</th>
                        <th>Кількість</th>
                        <th>Ціна за одиницю</th>
                        <th>Сума</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items
                      .map(
                        (item) => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>₴${item.price.toLocaleString()}</td>
                            <td>₴${(
                              item.quantity * item.price
                            ).toLocaleString()}</td>
                        </tr>
                    `
                      )
                      .join("")}
                    <tr class="total-row">
                        <td colspan="3" class="total">Загальна сума:</td>
                        <td class="total">₴${order.total_price.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://antiblackout.com/order-status/${
                  order.id
                }" class="cta-button">
                    Відстежити замовлення
                </a>
            </div>
            
            <div class="info-block">
                <h3>📋 Важлива інформація</h3>
                <ul>
                    <li>Очікуйте повідомлення від нашого менеджера протягом 30 хвилин</li>
                    <li>Ми зв'яжемося з вами для підтвердження деталей доставки</li>
                    <li>Всі товари проходять якісний контроль перед відправкою</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <h3>📞 Наші контакти</h3>
            <div class="contact-info">
                <p>📧 Email: <a href="mailto:antiblackoutsupp@gmail.com">antiblackoutsupp@gmail.com</a></p>
                <p>💬 Telegram: <a href="https://t.me/antiblackout_support">@antiblackout_support</a></p>
                <p>📍 Адреса: вул. Івана Франка 41, Львів</p>
            </div>
            <div class="thank-you">
                Дякуємо за довіру! Ми цінуємо кожного клієнта. 🙏
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Email sending function using SMTP
async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");

  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP credentials not found in environment variables");
  }

  // Using Gmail SMTP configuration
  const smtpConfig = {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  };

  // Create email message
  const message = {
    from: `"AntiBlackout" <${smtpUser}>`,
    to: to,
    subject: subject,
    html: html,
    text: `Дякуємо за замовлення! Номер замовлення: ${
      subject.split("№")[1]?.split(" ")[0] || "N/A"
    }`,
  };

  // For Deno, we'll use a simple fetch-based approach
  // In production, you might want to use a proper SMTP library
  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: "service_antiblackout",
      template_id: "template_order_confirmation",
      user_id: "user_antiblackout",
      template_params: {
        to_email: to,
        subject: subject,
        html_content: html,
        from_name: "AntiBlackout",
        from_email: smtpUser,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }
}

// Main handler
serve(async (req) => {
  try {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { order, customer }: RequestData = await req.json();

    // Validate required fields
    if (!order || !customer) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: order and customer",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!order.id || !order.total_price || !Array.isArray(order.items)) {
      return new Response(JSON.stringify({ error: "Invalid order data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!customer.email || !customer.name) {
      return new Response(JSON.stringify({ error: "Invalid customer data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create email content
    const subject = `Ваше замовлення №${order.id} успішно прийняте | AntiBlackout`;
    const html = createEmailHTML(order, customer);

    // Send email
    await sendEmail(customer.email, subject, html);

    // Log success
    console.log(
      `✅ Order confirmation email sent to ${customer.email} for order ${order.id}`
    );

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Order confirmation email sent successfully",
        orderId: order.id,
        customerEmail: customer.email,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error sending order confirmation email:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to send order confirmation email",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Content-Type": "application/json",
        },
      }
    );
  }
});
