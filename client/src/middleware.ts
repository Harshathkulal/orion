import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/image",
  "/chat",
  "/login",
  "/api/text",
  "/api/image",
  "/api/rag",
  "/api/upload",
  "/auth/callback",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow all API routes to pass through
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  if (
    userId &&
    req.nextUrl.pathname.startsWith("/auth") &&
    req.nextUrl.pathname !== "/auth/callback"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!userId && !req.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
