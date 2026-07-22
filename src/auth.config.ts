import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Edge-safe Auth.js config (no Prisma / bcrypt).
 * Used by middleware. Full Credentials provider lives in auth.ts.
 */
const githubConfigured =
  !!process.env.AUTH_GITHUB_ID && !!process.env.AUTH_GITHUB_SECRET;

export default {
  // GitHub only registers when env vars are set (credentials still work without them)
  providers: [...(githubConfigured ? [GitHub] : [])],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register");
      const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/applications") ||
        pathname.startsWith("/calendar") ||
        pathname.startsWith("/documents") ||
        pathname.startsWith("/api/applications") ||
        pathname.startsWith("/api/contacts") ||
        pathname.startsWith("/api/interviews") ||
        pathname.startsWith("/api/follow-ups") ||
        pathname.startsWith("/api/documents") ||
        pathname.startsWith("/api/dashboard");

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      if (isProtected) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
