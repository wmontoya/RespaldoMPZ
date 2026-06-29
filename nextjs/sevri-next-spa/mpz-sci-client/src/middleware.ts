import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const unprotectedRoutes = [
  "/",
  "/mpz-logo.png",
  "/session",
  "/providers",
  "/error",
  "/_log",
  "/api/auth",
  "/api/auth/",
  "/api/auth/session",
  "/api/auth/providers",
  "/api/auth/csrf",
  "/api/auth/signin",
  "/api/auth/signin/azure-ad",
  "/api/auth/callback",
  "/api/auth/callback/azure-ad",
  "/api/auth/_log",
  "/api/v1/auth",
  "/api/v1/auth/",
  "/api/v1/auth/exchange",
  "/api/v1/token",
  "/api/v1/token/",
  "/_next",
  "/mpz-logo.png"
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (unprotectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const { payload } = await jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    );

    if (!payload.department) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.log("Middleware: Token invalid, redirecting to /", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/session",
    "/providers",
    "/error",
    "/_log",
    "/api/auth/:path*",
    "/menu-Evaluations",
    "/menu-Evaluations/:path*",
    "/autoevaluation-surveys",
    "/autoevaluation-surveys/:path*",
    "/mature-model",
    "/mature-model/:path*",
    "/sevri-survey",
    "/sevri-survey/:path*",
    "/follow_up",
    "/follow_up/:path*",
    "/api/protected/:path*"
  ]
};