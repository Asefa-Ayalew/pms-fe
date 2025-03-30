import { decodeJwt } from "jose";
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import handleLogout from "./shared/utility/log-out";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  // profile: UserProfile;
}

export async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_API}/auth/refresh`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token.refreshToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("Refresh token expired");
        await handleLogout();
        return { ...token, error: "RefreshTokenExpired" };
      }
      throw new Error(`Failed to refresh token: ${response.status}`);
    }

    const data = await response.json();
    if (!data?.token || !data?.refreshToken) {
      throw new Error("Invalid refresh response");
    }

    return {
      ...token,
      accessToken: data.token,
      refreshToken: data.refreshToken,
    };
  } catch (error: any) {
    console.error("Error refreshing access token:", error.message);
    await handleLogout();
    return { ...token, error: "RefreshTokenError" };
  }
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  secret:
    process.env.AUTH_SECRET || "072+s5MdhjIugCd9Z0BEmhBVnkCRVQuxbzymIWASSuo=",
  trustHost: true,

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const authUser = user as AuthResponse;
        return {
          accessToken: authUser.accessToken,
          refreshToken: authUser.refreshToken,
        };
      }

      if (trigger === "update") {
        return {
          ...session,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        };
      }

      if (token.accessToken) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const decodedToken = decodeJwt(token.accessToken as string);
        const tokenExpiry = decodedToken.exp;
        const bufferTime = 30;

        if (tokenExpiry && currentTimestamp >= tokenExpiry - bufferTime) {
          console.log("Token needs refresh, requesting new token...");
          const newToken = await refreshAccessToken(token);
          return newToken.error ? { ...token } : newToken;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.error) {
        throw new Error(token.error);
      }
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
    },

    authorized: async ({ auth, request }) => {
      const pathname = request.nextUrl?.pathname;
      return pathname?.startsWith("/auth/") || !!auth;
    },
  },

  redirectProxyUrl: process.env.NEXT_PUBLIC_APP_API,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please enter your email and password.");
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_API}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const { accessToken, refreshToken, profile } = await response.json();
          if (!accessToken) throw new Error("Login failed");

          return { accessToken, refreshToken, profile };
        } catch (error: any) {
          console.error("Login error:", error.message);
          return null;
        }
      },
    }),
  ],
};
