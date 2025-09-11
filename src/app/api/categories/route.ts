import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Categories API: Starting request");
    const supabase = createServerClient();
    console.log("Categories API: Supabase client created");

    // Get all categories
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    console.log("Categories API: Query result:", { categories, error });

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { error: "Failed to fetch categories", details: error.message },
        { status: 500 }
      );
    }

    // Build category tree structure
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create all category objects
    categories?.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    });

    // Second pass: build the tree
    categories?.forEach((category) => {
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(categoryMap.get(category.id));
        }
      } else {
        rootCategories.push(categoryMap.get(category.id));
      }
    });

    const response = {
      success: true,
      categories: rootCategories,
      flat: categories,
    };

    console.log("Categories API: Returning response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
