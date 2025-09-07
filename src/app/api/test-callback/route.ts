import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Test callback received!");
    console.log("📝 Request URL:", request.url);
    console.log("📝 Request method:", request.method);
    console.log("📝 Headers:", Object.fromEntries(request.headers.entries()));

    const formData = await request.formData();
    const data = formData.get("data") as string;
    const signature = formData.get("signature") as string;

    console.log("📝 Form data received:", {
      hasData: !!data,
      hasSignature: !!signature,
      dataLength: data?.length || 0,
    });

    if (data) {
      try {
        const parsedData = JSON.parse(Buffer.from(data, "base64").toString());
        console.log("📝 Parsed data:", parsedData);
      } catch (parseError) {
        console.error("❌ Error parsing data:", parseError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Test callback received successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Test callback error:", error);
    return NextResponse.json(
      { error: "Test callback failed", details: error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Test callback endpoint is working",
    timestamp: new Date().toISOString(),
  });
}
