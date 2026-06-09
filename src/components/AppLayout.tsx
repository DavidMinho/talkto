"use client";

import { Suspense } from "react";
import BrandThemeProvider from "@/components/BrandThemeProvider";
import ChatShell from "@/components/chat/ChatShell";

export default function AppLayout({
  children,
  activeConversationId,
}: {
  children: React.ReactNode;
  activeConversationId?: string;
}) {
  return (
    <BrandThemeProvider>
      <Suspense fallback={null}>
        <ChatShell activeConversationId={activeConversationId}>
          {children}
        </ChatShell>
      </Suspense>
    </BrandThemeProvider>
  );
}
