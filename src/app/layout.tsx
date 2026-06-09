import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import ThemeRegistry from "@/components/ThemeRegistry";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talkto",
  description: "Group and direct messaging chat application",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <SessionProvider>
            <ThemeRegistry>{children}</ThemeRegistry>
          </SessionProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
