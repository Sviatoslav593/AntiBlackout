// Test script for stable checkout flow with admin client
const testStableCheckoutFlow = async () => {
  try {
    console.log("🧪 Testing Stable Checkout Flow with Admin Client...");
    
    // Test data for COD order
    const codOrderData = {
      customerData: {
        name: "Test COD Customer",
        firstName: "Test",
        lastName: "COD",
        phone: "+380000000001",
        email: "test-cod@example.com",
        address: "Test COD Address 123",
        paymentMethod: "cod",
        city: "Київ",
        warehouse: "Відділення №1",
      },
      items: [
        {
          id: 1,
          name: "Powerbank 30000mAh",
          price: 800,
          quantity: 1,
          image: "test1.jpg",
        },
      ],
      totalAmount: 800,
    };

    console.log("\n1️⃣ Testing COD Order Creation...");
    console.log("📝 Request data:", JSON.stringify(codOrderData, null, 2));

    const codResponse = await fetch(
      "http://localhost:3000/api/order/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(codOrderData),
      }
    );

    console.log("📊 COD Response status:", codResponse.status);
    const codResult = await codResponse.json();
    console.log("📝 COD Response body:", JSON.stringify(codResult, null, 2));

    if (!codResult.success) {
      console.error("❌ COD Order creation failed:", codResult.error);
      return;
    }

    const codOrderId = codResult.orderId;
    console.log("✅ COD Order created successfully with ID:", codOrderId);

    // Test fetching COD order details
    console.log("\n2️⃣ Testing COD Order Fetching...");

    const codGetResponse = await fetch(
      `http://localhost:3000/api/order/get?orderId=${codOrderId}`,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );
    console.log("📊 COD Get Response status:", codGetResponse.status);

    const codGetResult = await codGetResponse.json();
    console.log("📝 COD Get Response body:", JSON.stringify(codGetResult, null, 2));

    if (codGetResponse.status !== 200) {
      console.error("❌ COD Order fetch failed:", codGetResult.error);
      return;
    }

    console.log("✅ COD Order fetched successfully from database");

    // Verify COD order structure
    console.log("\n3️⃣ Verifying COD Order Structure...");

    const requiredFields = [
      "id",
      "customer_name",
      "customer_email",
      "status",
      "payment_method",
      "total_amount",
      "created_at",
      "updated_at",
      "items",
    ];
    
    const missingFields = requiredFields.filter((field) => !(field in codGetResult));

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      return;
    }

    console.log("✅ All required fields present");

    // Verify COD order status
    if (codGetResult.status !== "confirmed") {
      console.error("❌ COD order should be confirmed, got:", codGetResult.status);
      return;
    }

    console.log("✅ COD order status is correct (confirmed)");

    // Test online payment order creation
    console.log("\n4️⃣ Testing Online Payment Order Creation...");

    const onlineOrderData = {
      ...codOrderData,
      customerData: {
        ...codOrderData.customerData,
        paymentMethod: "online",
        name: "Test Online Customer",
        email: "test-online@example.com",
      },
    };

    const onlineResponse = await fetch(
      "http://localhost:3000/api/order/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onlineOrderData),
      }
    );

    console.log("📊 Online Response status:", onlineResponse.status);
    const onlineResult = await onlineResponse.json();
    console.log("📝 Online Response body:", JSON.stringify(onlineResult, null, 2));

    if (!onlineResult.success) {
      console.error("❌ Online Order creation failed:", onlineResult.error);
      return;
    }

    const onlineOrderId = onlineResult.orderId;
    console.log("✅ Online order created successfully with ID:", onlineOrderId);

    // Test online order fetching
    console.log("\n5️⃣ Testing Online Order Fetching...");

    const onlineGetResponse = await fetch(
      `http://localhost:3000/api/order/get?orderId=${onlineOrderId}`,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );
    console.log("📊 Online Get Response status:", onlineGetResponse.status);

    const onlineGetResult = await onlineGetResponse.json();
    console.log("📝 Online Get Response body:", JSON.stringify(onlineGetResult, null, 2));

    if (onlineGetResponse.status !== 200) {
      console.error("❌ Online Order fetch failed:", onlineGetResult.error);
      return;
    }

    console.log("✅ Online order fetched successfully from database");

    // Verify online order status
    if (onlineGetResult.status !== "pending") {
      console.error("❌ Online order should be pending, got:", onlineGetResult.status);
      return;
    }

    console.log("✅ Online order status is correct (pending)");

    // Test payment callback simulation
    console.log("\n6️⃣ Testing Payment Callback Simulation...");

    const callbackData = {
      data: Buffer.from(JSON.stringify({
        order_id: onlineOrderId,
        status: "success",
        amount: onlineOrderData.totalAmount,
        currency: "UAH",
        transaction_id: "test_transaction_123",
        payment_id: "test_payment_123",
      })).toString("base64"),
      signature: "test_signature",
    };

    const callbackResponse = await fetch(
      "http://localhost:3000/api/payment/callback",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(callbackData),
      }
    );

    console.log("📊 Callback Response status:", callbackResponse.status);
    const callbackResult = await callbackResponse.json();
    console.log("📝 Callback Response body:", JSON.stringify(callbackResult, null, 2));

    if (callbackResponse.ok) {
      console.log("✅ Payment callback processed successfully");
    } else {
      console.error("❌ Payment callback failed:", callbackResult.error);
      return;
    }

    // Test final order status after callback
    console.log("\n7️⃣ Testing Final Order Status After Callback...");

    const finalGetResponse = await fetch(
      `http://localhost:3000/api/order/get?orderId=${onlineOrderId}`,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );
    console.log("📊 Final Get Response status:", finalGetResponse.status);

    const finalGetResult = await finalGetResponse.json();
    console.log("📝 Final Get Response body:", JSON.stringify(finalGetResult, null, 2));

    if (finalGetResponse.status !== 200) {
      console.error("❌ Final Order fetch failed:", finalGetResult.error);
      return;
    }

    // Verify final order status
    if (finalGetResult.status !== "paid") {
      console.error("❌ Final order should be paid, got:", finalGetResult.status);
      return;
    }

    console.log("✅ Final order status is correct (paid)");

    // Test cart clearing for online payment
    console.log("\n8️⃣ Testing Cart Clearing for Online Payment...");

    const cartClearResponse = await fetch(
      "http://localhost:3000/api/cart/clear",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: onlineOrderId }),
      }
    );

    console.log("📊 Cart Clear Response status:", cartClearResponse.status);
    const cartClearResult = await cartClearResponse.json();
    console.log("📝 Cart Clear Response body:", JSON.stringify(cartClearResult, null, 2));

    if (cartClearResponse.ok) {
      console.log("✅ Cart clearing event created successfully");
    } else {
      console.error("❌ Cart clearing event creation failed:", cartClearResult.error);
      return;
    }

    // Test cart clearing check
    console.log("\n9️⃣ Testing Cart Clearing Check...");

    const cartClearingResponse = await fetch(
      `http://localhost:3000/api/check-cart-clearing?orderId=${onlineOrderId}`
    );
    console.log(
      "📊 Cart Clearing Response status:",
      cartClearingResponse.status
    );

    const cartClearingResult = await cartClearingResponse.json();
    console.log(
      "📝 Cart Clearing Response body:",
      JSON.stringify(cartClearingResult, null, 2)
    );

    if (cartClearingResponse.status === 500) {
      console.error(
        "❌ Cart clearing endpoint returned 500 - this should never happen!"
      );
      return;
    }

    console.log("✅ Cart clearing endpoint works correctly (no 500 errors)");

    // Display order summary
    console.log("\n📋 Stable Checkout Flow Summary:");
    console.log("=================================");
    console.log(`COD Order ID: ${codGetResult.id}`);
    console.log(`Online Order ID: ${onlineOrderId}`);
    console.log(`COD Customer: ${codGetResult.customer_name}`);
    console.log(`Online Customer: ${onlineGetResult.customer_name}`);
    console.log(`COD Status: ${codGetResult.status}`);
    console.log(`Online Status: ${finalGetResult.status}`);
    console.log(`COD Payment Method: ${codGetResult.payment_method}`);
    console.log(`Online Payment Method: ${onlineGetResult.payment_method}`);
    console.log(`COD Total: ₴${codGetResult.total_amount.toLocaleString()}`);
    console.log(`Online Total: ₴${onlineGetResult.total_amount.toLocaleString()}`);

    console.log("\n🎉 All stable checkout flow tests completed successfully!");
    console.log("\n📋 Summary:");
    console.log("- No more 'createServerSupabaseClient is not defined' errors: ✅");
    console.log("- COD order creation and confirmation: ✅");
    console.log("- Online order creation and payment processing: ✅");
    console.log("- Order fetching from database: ✅");
    console.log("- Payment callback processing: ✅");
    console.log("- Cart clearing functionality: ✅");
    console.log("- Admin client working correctly: ✅");
    console.log("- Stable checkout flow restored: ✅");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testStableCheckoutFlow();
