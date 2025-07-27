import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // THIS IS NOT SECURE!
  const { pathname } = request.nextUrl;

  // protected and public routes
  const protectedRoutes = ["/rag", "/api/rag"];
  const authPages = ["/login", "/signup"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthPage = authPages.some((page) => pathname.startsWith(page));

  // If user is not authenticated and tries to access a protected route
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is authenticated and tries to access the login page
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // All other cases: proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: ["/rag", "/api/rag", "/login", "/signup", "/"],
  runtime: "nodejs",
};
