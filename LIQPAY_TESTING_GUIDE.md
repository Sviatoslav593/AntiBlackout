# LiqPay Testing Guide

## 🧪 Testing Cart Clearing & Email Notifications

### **Problem**: 
After successful online payment:
- ❌ Cart was not cleared
- ❌ Email notifications were not sent
- ✅ Order data was displayed correctly

### **Solution Implemented**:
- Enhanced logging in payment callback
- Improved cart clearing in order success page
- Added test endpoints for debugging

## 🔧 Testing Steps

### **1. Test Callback Functionality**
```bash
# Start the development server
npm run dev

# In another terminal, test the callback
node test-callback.js
```

### **2. Test LiqPay Callback**
```bash
# Test LiqPay callback simulation
node test-liqpay-callback.js
```

### **3. Test Full Payment Flow**
1. Go to checkout page
2. Select "Оплата карткою онлайн"
3. Fill in customer details
4. Click "Оформити замовлення"
5. Click "Оплатити" on LiqPay form
6. Complete payment on LiqPay
7. Check if redirected to success page
8. Verify cart is cleared
9. Check email notifications

## 📊 Debug Information

### **Console Logs to Check**:
- `📞 LiqPay callback received` - Callback is triggered
- `✅ Payment successful, creating order` - Payment processed
- `🔄 Creating order after payment` - Order creation started
- `✅ Order created successfully` - Order created in Supabase
- `📧 Confirmation emails sent` - Emails sent
- `🧹 Cart cleared after successful order` - Cart cleared

### **localStorage Keys to Check**:
- `cart` - Should be null after successful order
- `pending_order_${orderId}` - Should be cleared after display
- `order_${orderId}` - Should be cleared after display

## 🐛 Troubleshooting

### **If Cart is Not Cleared**:
1. Check console logs for "🧹 Cart cleared"
2. Verify localStorage keys are removed
3. Check if order success page is reached

### **If Emails are Not Sent**:
1. Check console logs for "📧 Confirmation emails sent"
2. Verify Supabase order creation
3. Check email service configuration

### **If Order Data is Not Displayed**:
1. Check localStorage for `pending_order_${orderId}`
2. Verify API endpoint `/api/order-success`
3. Check console logs for data retrieval

## 🚀 Production Testing

### **LiqPay Sandbox**:
- Use test cards: `4242424242424242`
- Test different payment scenarios
- Verify callback handling

### **Email Testing**:
- Check customer email inbox
- Check admin email inbox
- Verify email content and formatting

## ✅ Expected Results

After successful online payment:
- ✅ Cart should be cleared
- ✅ Email notifications should be sent
- ✅ Order data should be displayed
- ✅ Console logs should show all steps
- ✅ localStorage should be cleaned up

## 🔧 Manual Testing Commands

```bash
# Test callback endpoint
curl -X POST http://localhost:3000/api/test-callback

# Test order success endpoint
curl "http://localhost:3000/api/order-success?orderId=test-123"

# Check localStorage in browser console
console.log(localStorage.getItem("cart"));
console.log(localStorage.getItem("pending_order_test-123"));
```

## 📝 Notes

- All test files are in the project root
- Console logs provide detailed debugging information
- Test endpoints are available for manual testing
- Production deployment should work with these fixes

**Ready for testing!** 🎉
