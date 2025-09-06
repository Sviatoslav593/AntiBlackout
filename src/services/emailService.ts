interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  customerPhone?: string;
  address?: string;
  paymentMethod?: string;
  city?: string;
}

interface AdminOrderNotification {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  paymentMethod?: string;
  city?: string;
  items: OrderItem[];
  total: number;
  orderDate: string;
}

// Email template function
function createOrderConfirmationHTML(order: Order): string {
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
                Привіт, ${order.customerName}! 👋
            </div>
            
            <p>Дякуємо за ваше замовлення! Ми отримали ваш запит і вже працюємо над його обробкою.</p>
            
            <div class="order-info">
                <div class="order-number">Замовлення №${order.id}</div>
                <span class="status">Очікує підтвердження</span>
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
                            <td>${item.productName}</td>
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
                        <td colspan="3">Загальна сума:</td>
                        <td>₴${order.total.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://antiblackout.shop/order-status/${
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

// Admin notification email template
function createAdminNotificationHTML(
  adminOrder: AdminOrderNotification
): string {
  return `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Нове замовлення #${adminOrder.orderId}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
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
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
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
        .alert {
            background: #fed7d7;
            border: 1px solid #feb2b2;
            color: #c53030;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .order-info {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .order-number {
            font-size: 24px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .customer-details {
            background: #e6fffa;
            border-left: 4px solid #38b2ac;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .delivery-details {
            background: #fff5e6;
            border-left: 4px solid #f6ad55;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
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
        .total-row td {
            background: #2d3748;
            color: white;
            font-size: 18px;
            font-weight: bold;
        }
        .footer {
            background: #2d3748;
            color: white;
            padding: 30px;
            text-align: center;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚡ AntiBlackout</div>
            <p>Нове замовлення отримано</p>
        </div>
        
        <div class="content">
            <div class="alert">
                🚨 НОВЕ ЗАМОВЛЕННЯ #${adminOrder.orderId}
            </div>
            
            <div class="order-info">
                <div class="order-number">Замовлення #${
                  adminOrder.orderId
                }</div>
                <p><strong>Дата:</strong> ${adminOrder.orderDate}</p>
                <p><strong>Статус:</strong> Очікує обробки</p>
            </div>
            
            <div class="customer-details">
                <h3>📋 Дані клієнта</h3>
                <p><strong>Ім'я:</strong> ${adminOrder.customerName}</p>
                <p><strong>Email:</strong> ${adminOrder.customerEmail}</p>
                ${
                  adminOrder.customerPhone
                    ? `<p><strong>Телефон:</strong> ${adminOrder.customerPhone}</p>`
                    : ""
                }
                ${
                  adminOrder.city
                    ? `<p><strong>Місто:</strong> ${adminOrder.city}</p>`
                    : ""
                }
                ${
                  adminOrder.address
                    ? `<p><strong>Адреса:</strong> ${adminOrder.address}</p>`
                    : ""
                }
                ${
                  adminOrder.paymentMethod
                    ? `<p><strong>Спосіб оплати:</strong> ${
                        adminOrder.paymentMethod === "online"
                          ? "Онлайн оплата"
                          : "Накладений платіж"
                      }</p>`
                    : ""
                }
            </div>
            
            <div class="delivery-details">
                <h3>🚚 Деталі доставки</h3>
                <p><strong>Місто:</strong> ${adminOrder.city || "Не вказано"}</p>
                <p><strong>Адреса доставки:</strong> ${adminOrder.address || "Не вказано"}</p>
                <p><strong>Спосіб оплати:</strong> ${
                  adminOrder.paymentMethod === "online"
                    ? "💳 Онлайн оплата"
                    : adminOrder.paymentMethod === "cash_on_delivery"
                    ? "💰 Накладений платіж"
                    : "Не вказано"
                }</p>
            </div>
            
            <h3>🛍️ Товари в замовленні</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Товар</th>
                        <th>Кількість</th>
                        <th>Ціна за од.</th>
                        <th>Сума</th>
                    </tr>
                </thead>
                <tbody>
                    ${adminOrder.items
                      .map(
                        (item) => `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.quantity}</td>
                            <td>₴${item.price.toLocaleString()}</td>
                            <td>₴${(
                              item.quantity * item.price
                            ).toLocaleString()}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3"><strong>Загальна сума:</strong></td>
                        <td><strong>₴${adminOrder.total.toLocaleString()}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://antiblackout.shop/admin/orders" class="cta-button">
                    Переглянути в адмін панелі
                </a>
            </div>
        </div>
        
        <div class="footer">
            <h3>AntiBlackout Admin Panel</h3>
            <p>Це автоматичне повідомлення про нове замовлення</p>
            <p>Час отримання: ${new Date().toLocaleString("uk-UA")}</p>
        </div>
    </div>
</body>
</html>`;
}

// Main function to send order confirmation email
export async function sendOrderConfirmationEmail(
  order: Order
): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const subject = `Ваше замовлення №${order.id} успішно прийняте | AntiBlackout`;
    const html = createOrderConfirmationHTML(order);

    // Create plain text version
    const text = `Дякуємо за замовлення!
    
Замовлення №${order.id}
Клієнт: ${order.customerName}
Email: ${order.customerEmail}

Товари:
${order.items
  .map(
    (item) =>
      `- ${item.productName} x${item.quantity} = ₴${(
        item.quantity * item.price
      ).toLocaleString()}`
  )
  .join("\n")}

Загальна сума: ₴${order.total.toLocaleString()}

Очікуйте повідомлення від нашого менеджера протягом 30 хвилин.

З повагою,
Команда AntiBlackout
antiblackoutsupp@gmail.com
@antiblackout_support`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AntiBlackout <no-reply@antiblackout.shop>",
        to: [order.customerEmail],
        subject: subject,
        html: html,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Resend API error: ${errorData.message || response.statusText}`
      );
    }

    const result = await response.json();
    console.log(
      `✅ Order confirmation email sent successfully. Email ID: ${result.id}`
    );

    return { success: true };
  } catch (error) {
    console.error("❌ Error sending order confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Function to send admin notification email
export async function sendAdminNotificationEmail(
  adminOrder: AdminOrderNotification
): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const subject = `🚨 НОВЕ ЗАМОВЛЕННЯ #${adminOrder.orderId} | AntiBlackout Admin`;
    const html = createAdminNotificationHTML(adminOrder);

    // Create plain text version
    const text = `🚨 НОВЕ ЗАМОВЛЕННЯ #${adminOrder.orderId}

📋 ДАНІ КЛІЄНТА:
Ім'я: ${adminOrder.customerName}
Email: ${adminOrder.customerEmail}
${adminOrder.customerPhone ? `Телефон: ${adminOrder.customerPhone}` : ""}

🚚 ДЕТАЛІ ДОСТАВКИ:
Місто: ${adminOrder.city || "Не вказано"}
Адреса: ${adminOrder.address || "Не вказано"}
Спосіб оплати: ${
  adminOrder.paymentMethod === "online"
    ? "💳 Онлайн оплата"
    : adminOrder.paymentMethod === "cash_on_delivery"
    ? "💰 Накладений платіж"
    : "Не вказано"
}

🛍️ ТОВАРИ:
${adminOrder.items
  .map(
    (item) =>
      `- ${item.productName} x${item.quantity} = ₴${(
        item.quantity * item.price
      ).toLocaleString()}`
  )
  .join("\n")}

Загальна сума: ₴${adminOrder.total.toLocaleString()}
Дата замовлення: ${adminOrder.orderDate}

Переглянути в адмін панелі: https://antiblackout.shop/admin/orders`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AntiBlackout <no-reply@antiblackout.shop>",
        to: ["antiblackout.orders@gmail.com"],
        subject: subject,
        html: html,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Resend API error: ${errorData.message || response.statusText}`
      );
    }

    const result = await response.json();
    console.log(
      `✅ Admin notification email sent successfully. Email ID: ${result.id}`
    );

    return { success: true };
  } catch (error) {
    console.error("❌ Error sending admin notification email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Combined function to send both customer and admin emails
export async function sendOrderEmails(order: Order): Promise<{
  customerEmail: { success: boolean; error?: string };
  adminEmail: { success: boolean; error?: string };
}> {
  console.log(`📧 Starting email sending process for order ${order.id}...`);

  // Prepare admin order data
  const adminOrder: AdminOrderNotification = {
    orderId: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    address: order.address,
    paymentMethod: order.paymentMethod,
    city: order.city,
    items: order.items,
    total: order.total,
    orderDate: new Date().toLocaleString("uk-UA"),
  };

  // Send emails in parallel for better performance
  const [customerResult, adminResult] = await Promise.allSettled([
    sendOrderConfirmationEmail(order),
    sendAdminNotificationEmail(adminOrder),
  ]);

  const customerEmail =
    customerResult.status === "fulfilled"
      ? customerResult.value
      : {
          success: false,
          error: customerResult.reason?.message || "Unknown error",
        };

  const adminEmail =
    adminResult.status === "fulfilled"
      ? adminResult.value
      : {
          success: false,
          error: adminResult.reason?.message || "Unknown error",
        };

  // Log results
  if (customerEmail.success) {
    console.log(`✅ Customer email sent successfully for order ${order.id}`);
  } else {
    console.error(
      `❌ Customer email failed for order ${order.id}:`,
      customerEmail.error
    );
  }

  if (adminEmail.success) {
    console.log(`✅ Admin email sent successfully for order ${order.id}`);
  } else {
    console.error(
      `❌ Admin email failed for order ${order.id}:`,
      adminEmail.error
    );
  }

  return {
    customerEmail,
    adminEmail,
  };
}

// Interface for order data from Supabase
interface SupabaseOrderData {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  order_items?: SupabaseOrderItem[];
}

interface SupabaseOrderItem {
  product_name?: string;
  quantity: number;
  price: number;
}

// Helper function to format order data for email
export function formatOrderForEmail(orderData: SupabaseOrderData): Order {
  return {
    id: orderData.id,
    customerName: orderData.customer_name,
    customerEmail: orderData.customer_email,
    customerPhone: orderData.customer_phone,
    address: orderData.branch, // branch contains the delivery address
    paymentMethod: orderData.payment_method,
    city: orderData.city,
    items:
      orderData.order_items?.map((item: SupabaseOrderItem) => ({
        productName: item.product_name || "Unknown Product",
        quantity: item.quantity,
        price: item.price,
      })) || [],
    total: orderData.total_amount,
  };
}
