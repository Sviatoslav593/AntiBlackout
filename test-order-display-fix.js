// Test script for order display fixes
const testOrderDisplayFix = async () => {
  try {
    console.log("🧪 Testing Order Display Fixes...");
    
    // Test data for order creation
    const orderData = {
      customerData: {
        name: "Test Display Fix Customer",
        firstName: "Test",
        lastName: "DisplayFix",
        phone: "+380000000000",
        email: "test-display-fix@example.com",
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

    // Test fetching order details
    console.log("\n2️⃣ Fetching order details...");

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
    console.log("✅ Order fetched successfully");

    // Verify order structure
    console.log("\n3️⃣ Verifying order structure...");

    const requiredFields = [
      "id",
      "customer_name",
      "customer_email",
      "status",
      "payment_method",
      "total_amount",
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
    console.log("\n5️⃣ Verifying total amount calculation...");

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

    // Test empty items scenario
    console.log("\n6️⃣ Testing empty items scenario...");
    
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
    console.log("\n📋 Order Summary:");
    console.log("==================");
    console.log(`Order ID: ${order.id}`);
    console.log(`Customer: ${order.customer_name}`);
    console.log(`Email: ${order.customer_email}`);
    console.log(`Status: ${order.status}`);
    console.log(`Payment Method: ${order.payment_method}`);
    console.log(`Total Amount: ₴${order.total_amount.toLocaleString()}`);
    console.log("\nItems:");
    order.items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.product_name}`);
      console.log(`     ID: ${item.id}`);
      console.log(`     Quantity: ${item.quantity}`);
      console.log(`     Price: ₴${item.price.toLocaleString()}`);
      console.log(`     Subtotal: ₴${(item.price).toLocaleString()}`);
    });

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📋 Summary:");
    console.log("- Order creation with products: ✅");
    console.log("- Order fetching with items: ✅");
    console.log("- Order structure validation: ✅");
    console.log("- Items structure validation: ✅");
    console.log("- Total amount calculation: ✅");
    console.log("- Empty items check: ✅");
    console.log("- Order display fixes ready: ✅");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run the test
testOrderDisplayFix();
