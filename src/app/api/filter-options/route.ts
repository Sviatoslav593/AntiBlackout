import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get only characteristics for the specific category
    const { data: products, error } = await supabase
      .from("products")
      .select("characteristics")
      .eq("category_id", parseInt(categoryId))
      .not("characteristics", "is", null);

    if (error) {
      console.error("Error fetching filter options:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch filter options" },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        options: {
          inputConnectors: [],
          outputConnectors: [],
          cableLengths: [],
        },
      });
    }

    // Extract unique values for each filter
    const inputConnectors = new Set<string>();
    const outputConnectors = new Set<string>();
    const cableLengths = new Set<string>();

    products.forEach((product) => {
      if (product.characteristics) {
        const input = product.characteristics["Вхід (Тип коннектора)"];
        if (input) {
          inputConnectors.add(input);
        }

        const output = product.characteristics["Вихід (Тип коннектора)"];
        if (output) {
          outputConnectors.add(output);
        }

        const length = product.characteristics["Довжина кабелю, м"];
        if (length) {
          cableLengths.add(String(length));
        }
      }
    });

    // Convert to arrays and sort
    const inputArray = Array.from(inputConnectors).sort();
    const outputArray = Array.from(outputConnectors).sort();
    const lengthArray = Array.from(cableLengths).sort((a, b) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.localeCompare(b);
    });

    return NextResponse.json({
      success: true,
      options: {
        inputConnectors: inputArray,
        outputConnectors: outputArray,
        cableLengths: lengthArray,
      },
    });
  } catch (error) {
    console.error("Error in filter-options API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
