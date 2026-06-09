"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { alpha } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SendIcon from "@mui/icons-material/Send";
import LinkIcon from "@mui/icons-material/Link";
import MenuIcon from "@mui/icons-material/Menu";
import ImageIcon from "@mui/icons-material/Image";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import CircularProgress from "@mui/material/CircularProgress";
import { apiFetch } from "@/lib/api-client";
import { connectSocket } from "@/lib/socket-client";
import { uploadChatImageFile } from "@/lib/upload-image";
import {
  CHAT_ACTION_RADIUS,
  CHAT_INPUT_RADIUS,
  otherBubbleRadius,
  ownBubbleRadius,
} from "@/theme/chat/surfaces";
import { useChatShell } from "@/components/chat/ChatShellContext";
import UserAvatar from "@/components/UserAvatar";
import ChatMessageContent from "./ChatMessageContent";
import OnlineIndicator from "./OnlineIndicator";
import TypingIndicator from "./TypingIndicator";
import InviteDialog from "./InviteDialog";

type Message = {
  id: string;
  content: string;
  imageUrl?: string | null;
  inviteToken?: string | null;
  createdAt: string;
  user: { id: string; name: string; avatarUrl?: string | null };
};

type ConversationDetail = {
  id: string;
  type: "GROUP" | "DM";
  name: string | null;
  peer?: { id: string; name: string; avatarUrl?: string | null; isOnline?: boolean };
  members: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    isOnline?: boolean;
  }[];
};

export default function ChatWindow({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { openSidebar, isMobile } = useChatShell();
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [sendError, setSendError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserId = session?.user?.id;

  const appendMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const replaceMessage = useCallback((tempId: string, message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) {
        return prev.filter((m) => m.id !== tempId);
      }
      return prev.map((m) => (m.id === tempId ? message : m));
    });
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const loadDetail = useCallback(async () => {
    const data = await apiFetch<ConversationDetail>(
      `/api/conversations/${conversationId}`,
    );
    setDetail(data);
  }, [conversationId]);

  const loadMessages = useCallback(async () => {
    const data = await apiFetch<{ messages: Message[] }>(
      `/api/conversations/${conversationId}/messages`,
    );
    setMessages(data.messages);
  }, [conversationId]);

  const markRead = useCallback(async () => {
    await apiFetch(`/api/conversations/${conversationId}/read`, {
      method: "POST",
    });
  }, [conversationId]);

  useEffect(() => {
    loadDetail().catch(console.error);
    loadMessages().catch(console.error);
    markRead().catch(console.error);
  }, [loadDetail, loadMessages, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit("conversation:join", { conversationId });

    const onMessage = (payload: {
      conversationId: string;
      message: Message;
    }) => {
      if (payload.conversationId !== conversationId) return;
      appendMessage(payload.message);
      markRead().catch(console.error);
    };

    const onTyping = (payload: {
      conversationId: string;
      userId: string;
      userName: string;
      isTyping: boolean;
    }) => {
      if (payload.conversationId !== conversationId) return;
      if (payload.userId === currentUserId) return;
      setTypingUser(payload.isTyping ? payload.userName : null);
    };

    const onConversationUpdated = (payload: {
      conversationId: string;
      memberCount?: number;
    }) => {
      if (payload.conversationId !== conversationId) return;
      if (payload.memberCount == null) return;
      loadDetail().catch(console.error);
    };

    const onPresence = (payload: {
      userId: string;
      status: "online" | "offline";
    }) => {
      setDetail((prev) => {
        if (!prev) return prev;
        const online = payload.status === "online";
        return {
          ...prev,
          peer:
            prev.peer?.id === payload.userId
              ? { ...prev.peer, isOnline: online }
              : prev.peer,
          members: prev.members.map((m) =>
            m.id === payload.userId ? { ...m, isOnline: online } : m,
          ),
        };
      });
    };

    const onPresenceSync = (payload: { onlineUserIds: string[] }) => {
      const onlineSet = new Set(payload.onlineUserIds);
      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          peer: prev.peer
            ? { ...prev.peer, isOnline: onlineSet.has(prev.peer.id) }
            : prev.peer,
          members: prev.members.map((m) => ({
            ...m,
            isOnline: onlineSet.has(m.id),
          })),
        };
      });
    };

    const onReconnect = () => {
      socket.emit("conversation:join", { conversationId });
      loadMessages().catch(console.error);
    };

    socket.on("message:new", onMessage);
    socket.on("message:sent", onMessage);
    socket.on("conversation:updated", onConversationUpdated);
    socket.on("typing:update", onTyping);
    socket.on("presence:update", onPresence);
    socket.on("presence:sync", onPresenceSync);
    socket.on("connect", onReconnect);

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message:new", onMessage);
      socket.off("message:sent", onMessage);
      socket.off("conversation:updated", onConversationUpdated);
      socket.off("typing:update", onTyping);
      socket.off("presence:update", onPresence);
      socket.off("presence:sync", onPresenceSync);
      socket.off("connect", onReconnect);
    };
  }, [conversationId, currentUserId, markRead, loadMessages, loadDetail, appendMessage]);

  useEffect(() => {
    if (!detail?.members.length) return;
    const socket = connectSocket();
    socket.emit("presence:subscribe", {
      userIds: detail.members.map((m) => m.id),
    });
  }, [detail]);

  const postMessage = async (payload: { content?: string; imageUrl?: string }) => {
    const socket = connectSocket();
    socket.emit("typing:stop", { conversationId });

    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      content: payload.content ?? "",
      imageUrl: payload.imageUrl ?? null,
      inviteToken: null,
      createdAt: new Date().toISOString(),
      user: {
        id: currentUserId ?? "",
        name: session?.user?.name ?? "คุณ",
        avatarUrl: session?.user?.avatarUrl ?? null,
      },
    };
    appendMessage(optimistic);

    try {
      const message = await apiFetch<Message>(
        `/api/conversations/${conversationId}/messages`,
        { method: "POST", body: JSON.stringify(payload) },
      );
      replaceMessage(tempId, message);
    } catch (err) {
      removeMessage(tempId);
      throw err;
    }
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content) return;

    setSendError("");
    setInput("");

    try {
      await postMessage({ content });
    } catch (err) {
      setInput(content);
      setSendError(err instanceof Error ? err.message : "ส่งข้อความไม่สำเร็จ");
    }
  };

  const handleImageSelect = async (file: File | null) => {
    if (!file) return;

    setSendError("");
    setUploadingImage(true);

    try {
      const uploaded = await uploadChatImageFile(file);
      const caption = input.trim();
      setInput("");
      await postMessage({
        content: caption || undefined,
        imageUrl: uploaded.url,
      });
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    const socket = connectSocket();
    socket.emit("typing:start", { conversationId });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId });
    }, 2000);
  };

  const title =
    detail?.type === "DM"
      ? detail.peer?.name ?? "แชทส่วนตัว"
      : detail?.name ?? "ห้องกลุ่ม";

  const handleLeaveGroup = async () => {
    if (!confirm("ต้องการออกจากกลุ่มนี้ใช่หรือไม่?")) return;

    setLeavingGroup(true);
    setSendError("");
    try {
      const result = await apiFetch<{ redirectUrl: string }>(
        `/api/conversations/${conversationId}/leave`,
        { method: "POST" },
      );
      router.push(result.redirectUrl);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "ออกจากกลุ่มไม่สำเร็จ");
    } finally {
      setLeavingGroup(false);
    }
  };

  const resolveAvatar = (userId: string, fromMessage?: string | null) => {
    if (fromMessage) return fromMessage;
    if (userId === currentUserId) return session?.user?.avatarUrl ?? null;
    if (detail?.type === "DM" && detail.peer?.id === userId) {
      return detail.peer.avatarUrl ?? null;
    }
    return detail?.members.find((m) => m.id === userId)?.avatarUrl ?? null;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          background: (t) =>
            `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.04)} 0%, ${alpha(t.palette.secondary.main, 0.06)} 100%)`,
        }}
      >
        {isMobile && (
          <IconButton onClick={openSidebar} size="small">
            <MenuIcon />
          </IconButton>
        )}
        {detail?.type === "DM" ? (
          <UserAvatar
            name={detail.peer?.name}
            avatarUrl={detail.peer?.avatarUrl}
            size={44}
          />
        ) : (
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: "primary.main",
              fontWeight: 700,
            }}
          >
            {title[0]?.toUpperCase()}
          </Avatar>
        )}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
            {title}
          </Typography>
          {detail?.type === "DM" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <OnlineIndicator online={detail.peer?.isOnline} />
              <Typography variant="caption" color="text.secondary">
                {detail.peer?.isOnline ? "ออนไลน์" : "ออฟไลน์"}
              </Typography>
            </Box>
          )}
          {detail?.type === "GROUP" && (
            <Typography variant="caption" color="text.secondary">
              สมาชิก {detail.members.length} คน
            </Typography>
          )}
        </Box>
        {detail?.type === "GROUP" ? (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0.75}
            sx={{ flexShrink: 0, alignItems: "stretch" }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => setInviteOpen(true)}
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 600,
                whiteSpace: "nowrap",
                px: 1.5,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              เชิญเข้ากลุ่ม
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLeaveGroup}
              disabled={leavingGroup}
              sx={{
                fontWeight: 600,
                whiteSpace: "nowrap",
                px: 1.5,
                borderColor: "divider",
                color: "text.primary",
                "&:hover": {
                  borderColor: "text.secondary",
                  bgcolor: "action.hover",
                },
              }}
            >
              {leavingGroup ? "กำลังออก..." : "ออกจากกลุ่ม"}
            </Button>
          </Stack>
        ) : (
          <IconButton
            onClick={() => setInviteOpen(true)}
            title="เชิญแชทส่วนตัว"
            sx={{
              bgcolor: "background.paper",
              boxShadow: (t) => `0 2px 8px ${t.palette.divider}`,
            }}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: { xs: 1.5, md: 2.5 },
          py: 2,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
        }}
      >
        {messages.map((msg) => {
          const isOwn = msg.user.id === currentUserId;
          const isInvite = Boolean(msg.inviteToken);
          const isCardBubble = Boolean(msg.imageUrl || isInvite);
          const avatarUrl = resolveAvatar(msg.user.id, msg.user.avatarUrl);

          return (
            <Box
              key={msg.id}
              sx={{
                mb: 2,
                display: "flex",
                flexDirection: isOwn ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              <UserAvatar
                name={msg.user.name}
                avatarUrl={avatarUrl}
                size={32}
                sx={{ mb: 2.25, flexShrink: 0 }}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isOwn ? "flex-end" : "flex-start",
                  maxWidth: "calc(100% - 44px)",
                }}
              >
                {detail?.type === "GROUP" && !isOwn && (
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "primary.main", mb: 0.5, px: 0.5 }}
                  >
                    {msg.user.name}
                  </Typography>
                )}
                <Paper
                  elevation={0}
                  sx={{
                    px: isCardBubble ? 1.25 : 2,
                    py: 1.25,
                    maxWidth: "100%",
                    borderRadius: isOwn ? ownBubbleRadius : otherBubbleRadius,
                    bgcolor:
                      isCardBubble || !isOwn ? "background.paper" : "primary.main",
                    color:
                      isCardBubble || !isOwn ? "text.primary" : "primary.contrastText",
                    boxShadow: isOwn
                      ? (t) => `0 4px 14px ${alpha(t.palette.primary.main, 0.25)}`
                      : (t) => `0 2px 12px ${alpha(t.palette.primary.main, 0.08)}`,
                  }}
                >
                  <ChatMessageContent
                    content={msg.content}
                    imageUrl={msg.imageUrl}
                    inviteToken={msg.inviteToken}
                    isOwn={isOwn}
                  />
                </Paper>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, px: 0.5 }}
                >
                  {new Date(msg.createdAt).toLocaleString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "numeric",
                    month: "short",
                  })}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      <TypingIndicator userName={typingUser} />

      {sendError && (
        <Typography color="error" variant="body2" sx={{ px: 2 }}>
          {sendError}
        </Typography>
      )}

      <Box
        sx={{
          p: 2,
          display: "flex",
          gap: 1,
          alignItems: "center",
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
        />
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          title="ส่งรูปภาพ"
          sx={{
            bgcolor: "background.default",
            border: 1,
            borderColor: "divider",
            borderRadius: `${CHAT_ACTION_RADIUS}px`,
          }}
        >
          {uploadingImage ? (
            <CircularProgress size={20} />
          ) : (
            <ImageIcon fontSize="small" />
          )}
        </IconButton>
        <TextField
          fullWidth
          placeholder="พิมพ์ข้อความ..."
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: `${CHAT_INPUT_RADIUS}px`,
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={sendMessage}
          disabled={!input.trim() || uploadingImage}
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: `${CHAT_ACTION_RADIUS}px`,
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": {
              bgcolor: "action.disabledBackground",
              color: "action.disabled",
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        conversationId={conversationId}
        inviteType={detail?.type === "DM" ? "DM" : "GROUP"}
      />
    </Box>
  );
}
