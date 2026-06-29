import { getToken } from "next-auth/jwt";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

// 🔴 OBLIGATORIO
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // ===============================
    // 1️⃣ TOKEN NEXTAUTH (Azure AD)
    // ===============================
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=no-session", req.url)
      );
    }

    const email =
      token.email ??
      (token as any).preferred_username ??
      (token as any).upn;

    if (!email) {
      return NextResponse.redirect(
        new URL("/login?error=no-email", req.url)
      );
    }

    // ===============================
    // 2️⃣ BACKEND ODOO
    // ===============================
    if (!process.env.BACKEND_URL_SSL) {
      throw new Error("BACKEND_URL_SSL no está definido");
    }

    const odooUrl = `${process.env.BACKEND_URL_SSL}/api/v1/auth/azure`;

    // 🔐 USAR SIEMPRE ID TOKEN
    const azureToken = (token as any).idToken;

    if (!azureToken) {
      return NextResponse.redirect(
        new URL("/login?error=no-azure-token", req.url)
      );
    }

    // ===============================
    // 3️⃣ LLAMADA A ODOO (JSON-RPC)
    // ===============================
    const odooResponse = await fetch(odooUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          token: azureToken
        }
      }),
    });

    const odooJson = await odooResponse.json();

    if (!odooResponse.ok || odooJson?.error) {
      return NextResponse.redirect(
        new URL("/login?error=odoo", req.url)
      );
    }

    const user = odooJson.result;

    if (!user?.department) {
      return NextResponse.redirect(
        new URL("/login?error=department", req.url)
      );
    }

    // ===============================
    // 4️⃣ JWT PROPIO
    // ===============================
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY no está definido");
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET_KEY
    );

    const jwt = await new SignJWT({
      email,
      department: user.department,
      roles: user.roles ?? [],
      user_id: user.user_id,
      department_name: user.department_name
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    // ===============================
    // 5️⃣ COOKIE + REDIRECT
    // ===============================
    const baseUrl = process.env.NEXTAUTH_URL!;
    const response = NextResponse.redirect(
      new URL(`${baseUrl}/menu-Evaluations`, req.url)
    );

    response.cookies.set("token", jwt, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60
    });

    return response;

  } catch (error) {
    console.error("AUTH EXCHANGE ERROR:", error);

    return NextResponse.redirect(
      new URL("/?error=internal", req.url)
    );
  }
}
