import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    return NextResponse.json({
      success: true,
      message: "API endpoint працює",
      orderNumber: orderNumber || "не вказано",
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
