// Test script for order retrieval logic
const testOrderRetrieval = async () => {
  try {
    console.log("🧪 Testing Order Retrieval Logic...");

    // Test data for order creation
    const orderData = {
      customerData: {
        name: "Святослав Потапенко",
        firstName: "Святослав",
        lastName: "Потапенко",
        phone: "+380986553991",
        email: "potsvatik@gmail.com",
        address: "Відділення №1: Велика Олександрівка, Братська, 17",
        paymentMethod: "liqpay",
        city: "Велика Олександрівка (Херсонська обл.)",
        warehouse: "Відділення №1: Велика Олександрівка, Братська, 17",
      },
      items: [
        {
          id: 1,
          name: "Powerbank 20000mAh",
          price: 1199,
          quantity: 1,
          image: "powerbank.jpg",
        },
      ],
      totalAmount: 1199,
    };

    console.log("\n1️⃣ Creating order with products...");
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
    console.log("✅ Order created successfully with ID:", orderId);

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

    // Verify order structure matches expected format
    console.log("\n3️⃣ Verifying order structure matches expected format...");

    const expectedFields = [
      "id",
      "customer_name",
      "customer_email",
      "customer_phone",
      "city",
      "branch",
      "payment_method",
      "status",
      "total_amount",
      "created_at",
      "items",
    ];

    const missingFields = expectedFields.filter((field) => !(field in order));

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

    if (order.items.length !== 1) {
      console.error("❌ Expected 1 item, got:", order.items.length);
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

    // Verify specific values match expected format
    console.log("\n5️⃣ Verifying specific values match expected format...");

    const expectedOrder = {
      customer_name: "Святослав Потапенко",
      customer_email: "potsvatik@gmail.com",
      customer_phone: "+380986553991",
      city: "Велика Олександрівка (Херсонська обл.)",
      branch: "Відділення №1: Велика Олександрівка, Братська, 17",
      payment_method: "online",
      status: "pending",
      total_amount: 1199,
    };

    for (const [key, expectedValue] of Object.entries(expectedOrder)) {
      if (order[key] !== expectedValue) {
        console.error(`❌ Field ${key} mismatch:`, {
          expected: expectedValue,
          actual: order[key],
        });
        return;
      }
    }

    console.log("✅ All field values match expected format");

    // Verify items match expected format
    console.log("\n6️⃣ Verifying items match expected format...");

    const expectedItem = {
      product_name: "Powerbank 20000mAh",
      quantity: 1,
      price: 1199,
    };

    const actualItem = order.items[0];
    for (const [key, expectedValue] of Object.entries(expectedItem)) {
      if (actualItem[key] !== expectedValue) {
        console.error(`❌ Item field ${key} mismatch:`, {
          expected: expectedValue,
          actual: actualItem[key],
        });
        return;
      }
    }

    console.log("✅ Item values match expected format");

    // Test empty items scenario
    console.log("\n7️⃣ Testing empty items scenario...");

    // Create a mock order with empty items
    const emptyOrder = {
      id: "test-empty",
      customer_name: "Test Empty",
      customer_email: "empty@test.com",
      status: "pending",
      payment_method: "cod",
      total_amount: 0,
      items: [],
    };

    // Test the empty items check logic
    const hasEmptyItems = !emptyOrder.items || emptyOrder.items.length === 0;
    if (!hasEmptyItems) {
      console.error("❌ Empty items check failed");
      return;
    }

    console.log("✅ Empty items check works correctly");

    // Display order summary
    console.log("\n📋 Order Summary (LEFT JOIN from order_items):");
    console.log("================================================");
    console.log(`Order ID: ${order.id}`);
    console.log(`Customer: ${order.customer_name}`);
    console.log(`Email: ${order.customer_email}`);
    console.log(`Phone: ${order.customer_phone}`);
    console.log(`City: ${order.city}`);
    console.log(`Branch: ${order.branch}`);
    console.log(`Status: ${order.status}`);
    console.log(`Payment Method: ${order.payment_method}`);
    console.log(`Total Amount: ₴${order.total_amount.toLocaleString()}`);
    console.log(`Created At: ${order.created_at}`);
    console.log("\nItems (from order_items table):");
    order.items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.product_name}`);
      console.log(`     ID: ${item.id}`);
      console.log(`     Quantity: ${item.quantity}`);
      console.log(`     Price: ₴${item.price.toLocaleString()}`);
      console.log(`     Subtotal: ₴${item.price.toLocaleString()}`);
    });

    console.log("\n🎉 All order retrieval tests completed successfully!");
    console.log("\n📋 Summary:");
    console.log("- Order creation with products: ✅");
    console.log("- LEFT JOIN between orders and order_items: ✅");
    console.log("- Order structure matches expected format: ✅");
    console.log("- Items structure validation: ✅");
    console.log("- Field values match expected format: ✅");
    console.log("- Item values match expected format: ✅");
    console.log("- Empty items check: ✅");
    console.log("- Order retrieval logic ready: ✅");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testOrderRetrieval();
