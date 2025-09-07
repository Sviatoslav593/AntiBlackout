# LiqPay Callback Debugging - Complete Analysis

## ✅ **Problem Identified**

### **Root Cause:**

After creating the `payment_sessions` table, payment sessions are being created successfully, but orders are not being created in the `orders` table. This indicates that the LiqPay callback is either not being called or not working properly.

### **Evidence:**

- ✅ `payment_sessions` table exists and has data
- ✅ Payment sessions are created with correct order IDs
- ❌ No matching order IDs found in `orders` table
- ❌ LiqPay callback may not be working properly

## 🔧 **Debugging Enhancements Added**

### **1. ✅ Enhanced LiqPay Callback Logging**

#### **Added to `/api/payment/liqpay-callback`:**

```typescript
// Request logging
console.log("🔄 Received LiqPay callback...");
console.log("📝 Request URL:", request.url);
console.log("📝 Request method:", request.method);

// Form data logging
console.log("📝 Form data received:", {
  hasData: !!data,
  hasSignature: !!signature,
  dataLength: data?.length || 0,
});

// Session query logging
console.log(
  "🔍 Looking for payment session with order_id:",
  paymentData.order_id
);
console.log("📊 Session query result:", {
  hasData: !!sessionData,
  error: sessionError,
  orderId: paymentData.order_id,
});

// Order creation logging
console.log("📋 Order data to insert:", {
  id: paymentData.order_id,
  customer_name: sessionData.customer_data.name,
  customer_email: sessionData.customer_data.email,
  total_amount: sessionData.total_amount,
  payment_method: "online",
});

console.log("📊 Order creation result:", {
  hasData: !!orderData,
  error: orderError,
  orderId: orderData?.id,
});
```

### **2. ✅ Improved Fallback Logic**

#### **Enhanced Error Handling:**

```typescript
if (sessionError || !sessionData) {
  // Only use fallback if session really doesn't exist
  if (sessionError?.code === "PGRST116") {
    // No rows found
    console.log("🔄 No payment session found, using fallback...");
    // ... fallback implementation
  } else {
    // Table doesn't exist or other error
    return NextResponse.json(
      { error: "Payment session not found", details: sessionError?.message },
      { status: 404 }
    );
  }
}
```

### **3. ✅ Test Callback Endpoint**

#### **Created `/api/test-callback`:**

```typescript
export async function POST(request: NextRequest) {
  console.log("🧪 Test callback received!");
  console.log("📝 Request URL:", request.url);
  console.log("📝 Request method:", request.method);
  console.log("📝 Headers:", Object.fromEntries(request.headers.entries()));

  // ... detailed logging for debugging
}
```

## 🧪 **Testing Results**

### **Payment Sessions Analysis:**

```
✅ Found 2 payment sessions
Recent payment sessions:
  1. Order ID: liqpay_1757263304041_4pxm08it2, Status: pending
  2. Order ID: liqpay_1757263152623_0bxs0g6qe, Status: pending

✅ Found 5 orders (all COD payments)
❌ Found 0 matching IDs between sessions and orders
```

### **Key Findings:**

1. **Payment sessions are created** ✅
2. **Orders are not being created** ❌
3. **No matching IDs** between sessions and orders
4. **LiqPay callback may not be working** ❌

## 🔍 **Debugging Steps**

### **1. Check LiqPay Callback Logs**

After making a test payment, check your server logs for:

```
🔄 Received LiqPay callback...
📝 Request URL: https://yourdomain.com/api/payment/liqpay-callback
📝 Request method: POST
📝 Form data received: { hasData: true, hasSignature: true, dataLength: 488 }
```

### **2. Test Callback Endpoint**

Test if your server can receive callbacks:

```bash
curl -X POST https://yourdomain.com/api/test-callback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "data=test&signature=test"
```

### **3. Check LiqPay Configuration**

Verify in your LiqPay session that:

- `server_url` is correct: `https://yourdomain.com/api/payment/liqpay-callback`
- `result_url` is correct: `https://yourdomain.com/order-success?orderId={orderId}`

### **4. Monitor Payment Session Status**

Check if payment sessions are being updated:

```sql
SELECT order_id, status, created_at, updated_at
FROM payment_sessions
ORDER BY created_at DESC;
```

## 🚀 **Next Steps**

### **Immediate Actions:**

1. **Deploy the updated code** with enhanced logging
2. **Make a test payment** and monitor server logs
3. **Check if LiqPay callback is being called**
4. **Verify callback URL accessibility**

### **If Callback is Not Working:**

1. **Check server accessibility** from external networks
2. **Verify HTTPS certificate** is valid
3. **Check firewall settings** for incoming requests
4. **Test with test callback endpoint** first

### **If Callback is Working but Orders Not Created:**

1. **Check session data structure** in logs
2. **Verify database permissions** for order creation
3. **Check for validation errors** in order creation
4. **Review error logs** for specific issues

## 📋 **Expected Log Flow**

### **Successful Payment Flow:**

```
1. 🔄 Received LiqPay callback...
2. 📝 Form data received: { hasData: true, hasSignature: true }
3. 🔍 Looking for payment session with order_id: liqpay_xxx
4. 📊 Session query result: { hasData: true, error: null }
5. ✅ Payment session found, proceeding with order creation...
6. 📋 Session data: { order_id: liqpay_xxx, customer_name: John Doe }
7. 🔄 Creating order from payment session...
8. 📊 Order creation result: { hasData: true, error: null, orderId: liqpay_xxx }
9. ✅ Order created: liqpay_xxx
10. ✅ Order items created: 2 items
11. ✅ Confirmation email sent
```

## 🎯 **Troubleshooting Guide**

### **Common Issues:**

1. **Callback not called**: Check server accessibility and URL configuration
2. **Session not found**: Verify payment session creation and order ID matching
3. **Order creation failed**: Check database permissions and validation
4. **Email not sent**: Verify email service configuration

### **Debug Commands:**

```bash
# Check recent payment sessions
curl -X GET "https://yourdomain.com/api/payment-sessions"

# Test callback endpoint
curl -X POST "https://yourdomain.com/api/test-callback" -d "test=data"

# Check server logs
tail -f /var/log/your-app.log | grep "LiqPay"
```

## ✅ **Summary**

The system now has comprehensive debugging capabilities to identify why orders are not being created after successful payment sessions. The enhanced logging will help pinpoint the exact issue in the LiqPay callback flow.

**Next step: Deploy and test with a real payment to see the detailed logs!** 🚀
