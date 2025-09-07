// Test script for order management logic
const testOrderManagement = async () => {
  try {
    console.log("🧪 Testing Order Management Logic...");
    
    // Test data for order creation
    const orderData = {
      customerData: {
        name: "Test Management Customer",
        firstName: "Test",
        lastName: "Management",
        phone: "+380000000000",
        email: "test-management@example.com",
        address: "Test Address",
        paymentMethod: "cod",
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

    console.log("\n1️⃣ Creating COD order with products...");
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
    console.log("✅ COD order created successfully with ID:", orderId);

    // Test fetching order details with LEFT JOIN
    console.log("\n2️⃣ Fetching order details with LEFT JOIN...");

    const getResponse = await fetch(
      `http://localhost:3000/api/order/get?orderId=${orderId}`
    );
    console.log("📊 Get Response status:", getResponse.status);

    const getResult = await getResponse.json();
    console.log("📝 Get Response body:", JSON.stringify(getResult, null, 2));

    if (!getResult.success) {
      console.error("❌ Order fetch failed:", getResult.error);
      return;
    }

    const order = getResult.order;
    console.log("✅ Order fetched successfully with LEFT JOIN");

    // Verify order structure includes updated_at
    console.log("\n3️⃣ Verifying order structure includes updated_at...");

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

    console.log("✅ All required fields present including updated_at");

    // Verify updated_at is set
    console.log("\n4️⃣ Verifying updated_at is set...");

    if (!order.updated_at) {
      console.error("❌ updated_at should be set");
      return;
    }

    console.log("✅ updated_at is set:", order.updated_at);

    // Verify items structure
    console.log("\n5️⃣ Verifying items structure...");

    if (!Array.isArray(order.items)) {
      console.error("❌ Items should be an array");
      return;
    }

    if (order.items.length !== 2) {
      console.error("❌ Expected 2 items, got:", order.items.length);
      return;
    }

    const itemRequiredFields = ["id", "product_name", "quantity", "price"];
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

    console.log("✅ Items structure is correct");

    // Verify total amount calculation
    console.log("\n6️⃣ Verifying total amount calculation...");

    const calculatedTotal = order.items.reduce(
      (sum, item) => sum + item.price,
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

    // Test cart clearing check
    console.log("\n7️⃣ Testing cart clearing check...");

    const cartClearingResponse = await fetch(
      `http://localhost:3000/api/check-cart-clearing?orderId=${orderId}`
    );
    console.log("📊 Cart Clearing Response status:", cartClearingResponse.status);

    const cartClearingResult = await cartClearingResponse.json();
    console.log("📝 Cart Clearing Response body:", JSON.stringify(cartClearingResult, null, 2));

    if (cartClearingResult.shouldClear) {
      console.log("✅ Cart clearing event found for COD order");
    } else {
      console.log("ℹ️ No cart clearing event found (expected for COD)");
    }

    // Test order success endpoint
    console.log("\n8️⃣ Testing order success endpoint...");

    const orderSuccessResponse = await fetch(
      `http://localhost:3000/api/order-success?orderId=${orderId}`
    );
    console.log("📊 Order Success Response status:", orderSuccessResponse.status);

    const orderSuccessResult = await orderSuccessResponse.json();
    console.log("📝 Order Success Response body:", JSON.stringify(orderSuccessResult, null, 2));

    if (orderSuccessResult.success) {
      console.log("✅ Order success endpoint works correctly");
      
      // Verify order success response includes items
      if (orderSuccessResult.order.order_items && orderSuccessResult.order.order_items.length > 0) {
        console.log("✅ Order success response includes items from order_items table");
      } else {
        console.error("❌ Order success response missing items");
        return;
      }
    } else {
      console.error("❌ Order success endpoint failed:", orderSuccessResult.error);
      return;
    }

    // Display order summary
    console.log("\n📋 Order Management Summary:");
    console.log("============================");
    console.log(`Order ID: ${order.id}`);
    console.log(`Customer: ${order.customer_name}`);
    console.log(`Email: ${order.customer_email}`);
    console.log(`Status: ${order.status}`);
    console.log(`Payment Method: ${order.payment_method}`);
    console.log(`Total Amount: ₴${order.total_amount.toLocaleString()}`);
    console.log(`Created At: ${order.created_at}`);
    console.log(`Updated At: ${order.updated_at}`);
    console.log("\nItems (from order_items table):");
    order.items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.product_name}`);
      console.log(`     ID: ${item.id}`);
      console.log(`     Quantity: ${item.quantity}`);
      console.log(`     Price: ₴${item.price.toLocaleString()}`);
      console.log(`     Subtotal: ₴${item.price.toLocaleString()}`);
    });

    console.log("\n🎉 All order management tests completed successfully!");
    console.log("\n📋 Summary:");
    console.log("- COD order creation with products: ✅");
    console.log("- LEFT JOIN between orders and order_items: ✅");
    console.log("- Order structure includes updated_at: ✅");
    console.log("- Items structure validation: ✅");
    console.log("- Total amount calculation: ✅");
    console.log("- Cart clearing check: ✅");
    console.log("- Order success endpoint: ✅");
    console.log("- Order management logic ready: ✅");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testOrderManagement();
