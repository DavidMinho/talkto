import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ensureAdminRole } from "@/lib/admin-access";
import { UserRoles } from "@/lib/roles";
import { getAuthSecret, loadRuntimeEnv } from "@/lib/runtime-env";
import { rateLimit } from "./api/rate-limit";
import { prisma } from "./db";

export function buildAuthOptions(): NextAuthOptions {
  loadRuntimeEnv();
  const secret = getAuthSecret();
  if (!secret) {
    console.error("[auth] Missing NEXTAUTH_SECRET or AUTH_SECRET");
  }

  return {
    providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase();
        const limit = rateLimit(`auth:${email}`, 10, 15 * 60 * 1000);
        if (!limit.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );
        if (!valid) return null;

        const role = await ensureAdminRole(user.id, user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role,
        };
      },
      }),
    ],
    session: { strategy: "jwt" },
    pages: {
      signIn: "/login",
    },
    callbacks: {
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.id = user.id;
          token.role = user.role;
          token.name = user.name;
          token.avatarUrl = user.avatarUrl ?? null;
        }

        if (trigger === "update" && session?.user) {
          if (session.user.name) token.name = session.user.name;
          if (session.user.avatarUrl !== undefined) {
            token.avatarUrl = session.user.avatarUrl;
          }
        }

        return token;
      },
      async session({ session, token }) {
        if (session.user && token.id) {
          session.user.id = token.id as string;
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { role: true, name: true, email: true, avatarUrl: true },
            });
            session.user.role = dbUser?.role ?? UserRoles.USER;
            session.user.name = dbUser?.name ?? (token.name as string);
            session.user.email = dbUser?.email ?? session.user.email;
            session.user.avatarUrl =
              dbUser?.avatarUrl ?? (token.avatarUrl as string | null) ?? null;
          } catch {
            session.user.role =
              (token.role as typeof UserRoles.USER) ?? UserRoles.USER;
            session.user.name = (token.name as string) ?? session.user.name;
            session.user.avatarUrl =
              (token.avatarUrl as string | null) ?? null;
          }
        }
        return session;
      },
    },
    secret,
  };
}

export const authOptions = buildAuthOptions();

export function getSession() {
  return getServerSession(buildAuthOptions());
}

export async function requireUserId() {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) {
    const { ApiError, ApiErrorCodes } = await import("./api/errors");
    throw new ApiError(ApiErrorCodes.UNAUTHORIZED, "Unauthorized", 401);
  }
  return userId;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user?.id) {
    const { ApiError, ApiErrorCodes } = await import("./api/errors");
    throw new ApiError(ApiErrorCodes.UNAUTHORIZED, "Unauthorized", 401);
  }
  if (session.user.role !== UserRoles.ADMIN) {
    const { ApiError, ApiErrorCodes } = await import("./api/errors");
    throw new ApiError(ApiErrorCodes.FORBIDDEN, "Admin access required", 403);
  }
  return session.user.id;
}
