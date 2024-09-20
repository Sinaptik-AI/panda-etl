import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GetAPIKey } from "@/services/user";

export async function middleware(request: NextRequest) {
  const apiKey = await GetAPIKey();

  if (!apiKey && !request.nextUrl.pathname.startsWith("/api-key-setup")) {
    return NextResponse.redirect(new URL("/api-key-setup", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
