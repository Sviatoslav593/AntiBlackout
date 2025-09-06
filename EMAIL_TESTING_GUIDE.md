# Email Testing Guide - LiqPay Integration

## 🎯 **Current Status:**
- ✅ Debug button removed
- ✅ Automatic cart clearing implemented
- 🔄 Email notifications need testing

## 🧪 **Email Testing Steps:**

### **1. Test Email Service Directly:**
```bash
# Start dev server
npm run dev

# Test email service
node test-email-simple.js
```

### **2. Test LiqPay Callback:**
```bash
# Test callback manually
node test-callback-manual.js
```

### **3. Test Full Payment Flow:**
1. Go to checkout page
2. Select "Оплата карткою онлайн"
3. Fill in customer details
4. Click "Оформити замовлення"
5. Click "Оплатити" on LiqPay form
6. Complete payment on LiqPay
7. Check if redirected to success page
8. Verify cart is cleared automatically
9. Check email notifications

## 🔍 **Debug Information:**

### **Console Logs to Check:**
- `📧 Sending test emails...` - Email service working
- `📞 LiqPay callback received` - Callback triggered
- `✅ Order created successfully` - Order created
- `📧 Confirmation emails sent` - Emails sent
- `🧹 Cart automatically cleared` - Cart cleared

### **API Endpoints for Testing:**
- `/api/test-email` - Test email service directly
- `/api/payment-callback` - Test LiqPay callback
- `/api/create-order-after-payment` - Test order creation

## 🚀 **Expected Results:**

### **After Successful Payment:**
- ✅ **Cart cleared automatically** (no manual button needed)
- ✅ **Email sent to customer** (confirmation)
- ✅ **Email sent to admin** (notification)
- ✅ **Order created in Supabase**
- ✅ **Order data displayed correctly**

### **Console Output:**
```
🧹 Cart automatically cleared after successful payment
📧 Confirmation emails sent for order [orderId]
✅ Order created successfully after payment: [orderId]
```

## 🐛 **Troubleshooting:**

### **If Emails Not Sent:**
1. Check console logs for email errors
2. Verify Resend API key is correct
3. Test with `/api/test-email` endpoint
4. Check email service configuration

### **If Cart Not Cleared:**
1. Check console logs for cart clearing
2. Verify order success page loads
3. Check localStorage in browser dev tools

### **If Order Not Created:**
1. Check console logs for order creation
2. Verify Supabase connection
3. Test with `/api/create-order-after-payment`

## 📊 **Test Commands:**

```bash
# Test email service
node test-email-simple.js

# Test callback
node test-callback-manual.js

# Test order creation
node test-create-order.js

# Test payment flow
node test-payment-flow.js
```

## ✅ **Ready for Testing:**

- ✅ **Debug button removed**
- ✅ **Automatic cart clearing**
- ✅ **Email testing tools**
- ✅ **Callback testing tools**
- 🔄 **Email notifications** - Need testing

**Протестуйте email повідомлення та автоматичне очищення кошика!** 🎉

**Всі інструменти для тестування готові!** 🚀✨
