import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ nextauth: string[] }> };
type AuthHandler = (
  req: NextRequest,
  ctx: RouteContext,
) => Promise<Response> | Response;

let handler: AuthHandler | null = null;

async function getHandler(): Promise<AuthHandler> {
  if (handler) return handler;

  const { buildAuthOptions } = await import("@/lib/auth");
  handler = NextAuth(buildAuthOptions()) as unknown as AuthHandler;
  return handler;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const auth = await getHandler();
  return auth(req, ctx);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const auth = await getHandler();
  return auth(req, ctx);
}
