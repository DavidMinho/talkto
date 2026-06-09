"use client";

import { createContext, useContext } from "react";

type ChatShellContextValue = {
  openSidebar: () => void;
  isMobile: boolean;
};

export const ChatShellContext = createContext<ChatShellContextValue>({
  openSidebar: () => {},
  isMobile: false,
});

export function useChatShell() {
  return useContext(ChatShellContext);
}
