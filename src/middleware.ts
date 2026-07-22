import NextAuth from "next-auth";
import authConfig from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

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
