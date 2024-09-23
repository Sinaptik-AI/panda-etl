import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GetAPIKey } from "@/services/user";
import localStorage from "@/lib/localStorage";

export async function middleware(request: NextRequest) {
  let apiKey = null;
  try {
    apiKey = await GetAPIKey();
  } catch (error) {
    return NextResponse.redirect(new URL("/api-key-setup", request.url));
  }

  if (!apiKey && !request.nextUrl.pathname.startsWith("/api-key-setup")) {
    return NextResponse.redirect(new URL("/api-key-setup", request.url));
  }

  localStorage.setItem("api_key", apiKey.data.api_key);

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
