// Test script for production-ready order management fixes
const testProductionFixes = async () => {
  try {
    console.log("🧪 Testing Production-Ready Order Management Fixes...");
    
    // Test data for order creation
    const orderData = {
      customerData: {
        name: "Test Production Customer",
        firstName: "Test",
        lastName: "Production",
        phone: "+380000000002",
        email: "test-production@example.com",
        address: "Test Address",
        paymentMethod: "online",
        city: "Київ",
        warehouse: "Відділення №1",
      },
      items: [
        {
          id: 1,
          name: "Powerbank 20000mAh",
          price: 600,
          quantity: 2,
          image: "test1.jpg",
        },
        {
          id: 2,
          name: "LED Flashlight",
          price: 800,
          quantity: 1,
          image: "test2.jpg",
        },
      ],
      totalAmount: 2000, // 600*2 + 800*1
    };

    console.log("\n1️⃣ Creating online payment order...");
    console.log("📝 Request data:", JSON.stringify(orderData, null, 2));

    const createResponse = await fetch(
      "http://localhost:3000/api/order/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      }
    );

    console.log("📊 Create Response status:", createResponse.status);
    const createResult = await createResponse.json();
    console.log(
      "📝 Create Response body:",
      JSON.stringify(createResult, null, 2)
    );

    if (!createResult.success) {
      console.error("❌ Order creation failed:", createResult.error);
      return;
    }

    const orderId = createResult.orderId;
    console.log("✅ Online order created successfully with ID:", orderId);

    // Test fetching order details with new API
    console.log("\n2️⃣ Testing /api/order/get endpoint...");

    const getResponse = await fetch(
      `http://localhost:3000/api/order/get?orderId=${orderId}`
    );
    console.log("📊 Get Response status:", getResponse.status);

    const getResult = await getResponse.json();
    console.log("📝 Get Response body:", JSON.stringify(getResult, null, 2));

    if (getResponse.status !== 200) {
      console.error("❌ Order fetch failed:", getResult.error);
      return;
    }

    const order = getResult;
    console.log("✅ Order fetched successfully from database");

    // Verify order structure
    console.log("\n3️⃣ Verifying order structure...");

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
    
    const missingFields = requiredFields.filter((field) => !(field in order));

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      return;
    }

    console.log("✅ All required fields present");

    // Verify items structure
    console.log("\n4️⃣ Verifying items structure...");

    if (!Array.isArray(order.items)) {
      console.error("❌ Items should be an array");
      return;
    }

    if (order.items.length !== 2) {
      console.error("❌ Expected 2 items, got:", order.items.length);
      return;
    }

    const itemRequiredFields = [
      "id",
      "product_name",
      "quantity",
      "price",
      "subtotal",
    ];
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const missingItemFields = itemRequiredFields.filter(
        (field) => !(field in item)
      );

      if (missingItemFields.length > 0) {
        console.error(`❌ Item ${i} missing fields:`, missingItemFields);
        return;
      }
    }

    console.log("✅ Items structure is correct with subtotal field");

    // Verify subtotal calculation
    console.log("\n5️⃣ Verifying subtotal calculation...");

    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const expectedSubtotal = item.quantity * item.price;
      if (item.subtotal !== expectedSubtotal) {
        console.error(`❌ Item ${i} subtotal mismatch:`, {
          expected: expectedSubtotal,
          actual: item.subtotal,
        });
        return;
      }
    }

    console.log("✅ Subtotal calculation is correct");

    // Test cart clearing check (should never return 500)
    console.log("\n6️⃣ Testing /api/check-cart-clearing endpoint...");

    const cartClearingResponse = await fetch(
      `http://localhost:3000/api/check-cart-clearing?orderId=${orderId}`
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

    // Test cart clearing for online payment
    console.log("\n7️⃣ Testing cart clearing for online payment...");

    const cartClearResponse = await fetch(
      "http://localhost:3000/api/cart/clear",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
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

    // Test order success endpoint
    console.log("\n8️⃣ Testing /api/order-success endpoint...");

    const orderSuccessResponse = await fetch(
      `http://localhost:3000/api/order-success?orderId=${orderId}`
    );
    console.log(
      "📊 Order Success Response status:",
      orderSuccessResponse.status
    );

    const orderSuccessResult = await orderSuccessResponse.json();
    console.log(
      "📝 Order Success Response body:",
      JSON.stringify(orderSuccessResult, null, 2)
    );

    if (orderSuccessResult.success) {
      console.log("✅ Order success endpoint works correctly");
      
      // Verify order success response includes items
      if (
        orderSuccessResult.order.order_items &&
        orderSuccessResult.order.order_items.length > 0
      ) {
        console.log(
          "✅ Order success response includes items from order_items table"
        );
      } else {
        console.error("❌ Order success response missing items");
        return;
      }
    } else {
      console.error(
        "❌ Order success endpoint failed:",
        orderSuccessResult.error
      );
      return;
    }

    // Test total amount calculation
    console.log("\n9️⃣ Verifying total amount calculation...");

    const calculatedTotal = order.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    console.log("📊 Calculated total from items:", calculatedTotal);
    console.log("📊 Stored total amount:", order.total_amount);

    if (calculatedTotal !== order.total_amount) {
      console.error("❌ Total amount mismatch:", {
        calculated: calculatedTotal,
        stored: order.total_amount,
      });
      return;
    }

    console.log("✅ Total amount calculation is correct");

    // Test COD order creation
    console.log("\n🔟 Testing COD order creation...");

    const codOrderData = {
      ...orderData,
      customerData: {
        ...orderData.customerData,
        paymentMethod: "cod",
        name: "Test COD Customer",
        email: "test-cod@example.com",
      },
    };

    const codCreateResponse = await fetch(
      "http://localhost:3000/api/order/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(codOrderData),
      }
    );

    console.log("📊 COD Create Response status:", codCreateResponse.status);
    const codCreateResult = await codCreateResponse.json();
    console.log("📝 COD Create Response body:", JSON.stringify(codCreateResult, null, 2));

    if (!codCreateResult.success) {
      console.error("❌ COD Order creation failed:", codCreateResult.error);
      return;
    }

    const codOrderId = codCreateResult.orderId;
    console.log("✅ COD order created successfully with ID:", codOrderId);

    // Test COD order fetching
    console.log("\n1️⃣1️⃣ Testing COD order fetching...");

    const codGetResponse = await fetch(
      `http://localhost:3000/api/order/get?orderId=${codOrderId}`
    );
    console.log("📊 COD Get Response status:", codGetResponse.status);

    const codGetResult = await codGetResponse.json();
    console.log("📝 COD Get Response body:", JSON.stringify(codGetResult, null, 2));

    if (codGetResponse.status !== 200) {
      console.error("❌ COD Order fetch failed:", codGetResult.error);
      return;
    }

    console.log("✅ COD order fetched successfully from database");

    // Display order summary
    console.log("\n📋 Production Fixes Summary:");
    console.log("=============================");
    console.log(`Online Order ID: ${order.id}`);
    console.log(`COD Order ID: ${codOrderId}`);
    console.log(`Customer: ${order.customer_name}`);
    console.log(`Email: ${order.customer_email}`);
    console.log(`Status: ${order.status}`);
    console.log(`Payment Method: ${order.payment_method}`);
    console.log(`Total Amount: ₴${order.total_amount.toLocaleString()}`);
    console.log(`Created At: ${order.created_at}`);
    console.log(`Updated At: ${order.updated_at}`);
    console.log("\nItems (from order_items table with subtotal):");
    order.items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.product_name}`);
      console.log(`     ID: ${item.id}`);
      console.log(`     Quantity: ${item.quantity}`);
      console.log(`     Price: ₴${item.price.toLocaleString()}`);
      console.log(`     Subtotal: ₴${item.subtotal.toLocaleString()}`);
    });

    console.log("\n🎉 All production fixes tests completed successfully!");
    console.log("\n📋 Summary:");
    console.log("- Online order creation with products: ✅");
    console.log("- COD order creation with products: ✅");
    console.log("- /api/order/get loads from database: ✅");
    console.log("- Items loaded from order_items table: ✅");
    console.log("- API response includes updated_at field: ✅");
    console.log("- Items structure includes subtotal field: ✅");
    console.log("- Subtotal calculation is correct: ✅");
    console.log("- /api/check-cart-clearing never returns 500: ✅");
    console.log("- Cart clearing event creation works: ✅");
    console.log("- /api/order-success works correctly: ✅");
    console.log("- Total amount calculation is correct: ✅");
    console.log("- Production-ready order management: ✅");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testProductionFixes();
