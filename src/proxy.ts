import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

// Next.js 16 uses proxy.ts (replaces middleware.ts)
export default auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/applications/:path*",
    "/calendar/:path*",
    "/documents/:path*",
    "/api/applications/:path*",
    "/api/contacts/:path*",
    "/api/interviews/:path*",
    "/api/follow-ups/:path*",
    "/api/documents/:path*",
    "/api/dashboard/:path*",
    "/login",
    "/register",
  ],
};
