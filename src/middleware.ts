import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/chats/:path*",
    "/admin",
    "/admin/:path*",
    "/api/conversations/:path*",
    "/api/uploads/:path*",
    "/api/dm",
    "/api/users/:path*",
    "/api/invites/:path*/accept",
    "/api/admin/:path*",
  ],
};
