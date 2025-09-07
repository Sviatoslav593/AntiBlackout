import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface StatusUpdateRequest {
  orderId: string;
  status: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Starting status email sending process...');

    const body: StatusUpdateRequest = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    console.log('📧 Status update request:', { orderId, status });

    // Отримуємо дані замовлення
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('❌ Error fetching order:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('📧 Order data retrieved:', {
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      currentStatus: order.status
    });

    // Отримуємо товари замовлення для email
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        product_name,
        quantity,
        price,
        product_id,
        products (image_url)
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError);
    }

    // Форматуємо статус для відображення
    const getStatusDisplay = (status: string) => {
      switch (status) {
        case 'pending':
          return 'Очікує оплати';
        case 'paid':
          return 'Оплачено';
        case 'confirmed':
          return 'Підтверджено';
        case 'processing':
          return 'В обробці';
        case 'shipped':
          return 'Відправлено';
        case 'delivered':
          return 'Доставлено';
        case 'cancelled':
          return 'Скасовано';
        default:
          return status;
      }
    };

    const statusDisplay = getStatusDisplay(status);

    // Створюємо HTML для email
    const createEmailHTML = () => {
      const itemsHTML = orderItems?.map(item => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; text-align: center;">
            ${item.products?.image_url ? 
              `<img src="${item.products.image_url}" alt="${item.product_name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` : 
              '<div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280;">📦</div>'
            }
          </td>
          <td style="padding: 12px;">
            <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${item.product_name}</div>
            <div style="color: #6b7280; font-size: 14px;">Кількість: ${item.quantity}</div>
          </td>
          <td style="padding: 12px; text-align: right; font-weight: 600; color: #111827;">
            ${item.price.toLocaleString()} ₴
          </td>
        </tr>
      `).join('') || '';

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Статус замовлення змінено</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                📦 Статус замовлення змінено
              </h1>
              <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px;">
                Ваше замовлення оновлено
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 32px;">
              <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h2 style="color: #0c4a6e; margin: 0 0 12px 0; font-size: 18px; font-weight: 600;">
                  Вітаємо, ${order.customer_name}!
                </h2>
                <p style="color: #0c4a6e; margin: 0; font-size: 16px; line-height: 1.5;">
                  Статус вашого замовлення <strong>№${order.order_number}</strong> змінено на:
                </p>
                <div style="background-color: #ffffff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 12px; margin: 12px 0; text-align: center;">
                  <span style="color: #0c4a6e; font-size: 18px; font-weight: 700;">${statusDisplay}</span>
                </div>
              </div>

              ${orderItems && orderItems.length > 0 ? `
                <div style="margin-bottom: 24px;">
                  <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                    Товари в замовленні:
                  </h3>
                  <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                    <thead style="background-color: #f9fafb;">
                      <tr>
                        <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151; font-size: 14px;">Фото</th>
                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; font-size: 14px;">Товар</th>
                        <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; font-size: 14px;">Ціна</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHTML}
                    </tbody>
                  </table>
                </div>
              ` : ''}

              <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 16px;">Загальна сума замовлення:</span>
                  <span style="color: #111827; font-size: 20px; font-weight: 700;">${order.total_amount.toLocaleString()} ₴</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <span style="color: #6b7280; font-size: 14px;">Спосіб оплати:</span>
                  <span style="color: #111827; font-size: 14px; font-weight: 600;">
                    ${order.payment_method === 'online' ? 'Оплата карткою онлайн' : 'Післяплата'}
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #6b7280; font-size: 14px;">Дата замовлення:</span>
                  <span style="color: #111827; font-size: 14px;">
                    ${new Date(order.created_at).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://antiblackout.shop/order-status/${order.order_number}" 
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  🔍 Відстежити замовлення
                </a>
              </div>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
                  Якщо у вас є питання щодо замовлення, зверніться до нашої служби підтримки.
                </p>
                <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
                  З повагою,<br><strong>Команда Antiblackout</strong>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © 2024 Antiblackout. Всі права захищені.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    // Відправляємо email
    const emailData = {
      from: 'Antiblackout <noreply@antiblackout.shop>',
      to: [order.customer_email],
      subject: `Статус замовлення №${order.order_number} змінено на "${statusDisplay}"`,
      html: createEmailHTML(),
    };

    console.log('📧 Sending status email to:', order.customer_email);

    const emailResult = await resend.emails.send(emailData);

    if (emailResult.error) {
      console.error('❌ Error sending status email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send status email', details: emailResult.error },
        { status: 500 }
      );
    }

    console.log('✅ Status email sent successfully:', emailResult.data);

    return NextResponse.json({
      success: true,
      message: 'Status email sent successfully',
      emailId: emailResult.data?.id,
    });

  } catch (error) {
    console.error('❌ Error in send-status-email API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
