import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET || "qurilish_super_secret_jwt_key_2026_abdulxodiy";

async function verifyEdgeToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [header, payload, sig] = parts;
    const data = `${header}.${payload}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    let b64 = sig.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const binStr = atob(b64);
    const sigBytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      sigBytes[i] = binStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(data));
    if (!isValid) return false;

    let pB64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (pB64.length % 4) pB64 += "=";
    const parsed = JSON.parse(atob(pB64));
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

const protectedPaths = [
  "/dashboard",
  "/pos",
  "/inventory",
  "/debts",
  "/finance",
  "/orders",
  "/users",
  "/applications",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isValid = await verifyEdgeToken(token);
    if (!isValid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth_token");
      return response;
    }

    return NextResponse.next();
  }

  // Agar login qilgan bo'lsa va /login ga kelsa, /dashboard ga yo'naltirish
  if (pathname === "/login") {
    const token = request.cookies.get("auth_token")?.value;
    if (token) {
      const isValid = await verifyEdgeToken(token);
      if (isValid) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pos/:path*",
    "/inventory/:path*",
    "/debts/:path*",
    "/finance/:path*",
    "/orders/:path*",
    "/users/:path*",
    "/applications/:path*",
    "/login",
  ],
};
