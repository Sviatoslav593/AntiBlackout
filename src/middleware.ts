import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization");

  // Захищаємо всі адмін-сторінки
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!basicAuth) {
      return new NextResponse("Auth required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
      });
    }

    try {
      const authValue = basicAuth.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");

      const validUser = process.env.ADMIN_USER || "admin";
      const validPass = process.env.ADMIN_PASS || "secret123";

      if (user !== validUser || pwd !== validPass) {
        return new NextResponse("Invalid credentials", { status: 403 });
      }
    } catch (error) {
      return new NextResponse("Invalid authorization header", { status: 400 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
