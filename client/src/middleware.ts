import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
        headers: await headers()
    })
 
  const { pathname } = request.nextUrl;
  console.log("Session:", session);

  // THIS IS NOT SECURE!
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  

    if (session && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/rag"],
};
