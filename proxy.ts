import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);
const isForbiddenRoute = createRouteMatcher(["/forbidden"]);
const adminAllowlist = new Set(["bluka1120@gmail.com", "blukacode@gmail.com"]);

const allowedOrigins = new Set([
  "https://nail-salon-web-ochre.vercel.app",
  "https://nail-salon-delta-eight.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
]);

function applyCorsHeaders(response: NextResponse, req: NextRequest) {
  const origin = req.headers.get("origin");

  if (origin && allowedOrigins.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set("Vary", "Origin");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}

async function getUserEmail(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  return (
    user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user.emailAddresses[0]?.emailAddress
  );
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Public API routes are consumed by the separate client app, so handle CORS
  // before any admin auth logic.
  if (isApiRoute(req) && req.method === "OPTIONS") {
    return applyCorsHeaders(new NextResponse(null, { status: 204 }), req);
  }

  if (isApiRoute(req)) {
    return applyCorsHeaders(NextResponse.next(), req);
  }

  if (isForbiddenRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.next();
    }

    const email = await getUserEmail(userId);

    if (email && adminAllowlist.has(email.toLowerCase())) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  }

  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth.protect();
  const email = await getUserEmail(userId);

  if (!email || !adminAllowlist.has(email.toLowerCase())) {
    return NextResponse.redirect(new URL("/forbidden", req.url));
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
