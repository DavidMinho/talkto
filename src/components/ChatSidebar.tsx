"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { alpha } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import { apiFetch } from "@/lib/api-client";
import { connectSocket } from "@/lib/socket-client";
import {
  CHAT_PANEL_RADIUS,
  chatListItemSx,
  chatListSx,
} from "@/theme/chat/surfaces";
import UserAvatar from "@/components/UserAvatar";
import OnlineIndicator from "./OnlineIndicator";
import UnreadBadge from "./UnreadBadge";

type ConversationItem = {
  id: string;
  type: "GROUP" | "DM";
  name: string | null;
  unreadCount: number;
  memberCount?: number;
  peer?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    isOnline?: boolean;
  };
  lastMessage: { content: string; createdAt: string } | null;
};

type UserResult = { id: string; name: string; email: string };

export default function ChatSidebar({
  activeConversationId,
  onNavigate,
}: {
  activeConversationId?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [tab, setTab] = useState<"GROUP" | "DM">("GROUP");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [dmDialogOpen, setDmDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConversations = useCallback(async (typeOverride?: "GROUP" | "DM") => {
    const listType = typeOverride ?? tab;
    setListLoading(true);
    setError("");
    try {
      const data = await apiFetch<ConversationItem[]>(
        `/api/conversations?type=${listType}`,
      );
      setConversations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดรายการไม่สำเร็จ");
    } finally {
      setListLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeConversationId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId ? { ...c, unreadCount: 0 } : c,
      ),
    );
  }, [activeConversationId]);

  useEffect(() => {
    if (!currentUserId) return;

    const socket = connectSocket();

    const onConversationUpdated = (payload: {
      conversationId: string;
      lastMessage?: { content: string; createdAt: string };
      senderId?: string;
      memberCount?: number;
    }) => {
      if (payload.memberCount != null && !payload.lastMessage) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === payload.conversationId
              ? { ...c, memberCount: payload.memberCount }
              : c,
          ),
        );
        return;
      }

      if (!payload.lastMessage || !payload.senderId) return;

      const isActive = payload.conversationId === activeConversationId;
      const isOwn = payload.senderId === currentUserId;

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === payload.conversationId);
        if (idx === -1) {
          setTab("DM");
          loadConversations("DM").catch(console.error);
          return prev;
        }

        const conv = prev[idx];
        const updated: ConversationItem = {
          ...conv,
          lastMessage: payload.lastMessage!,
          unreadCount:
            isActive || isOwn ? conv.unreadCount : conv.unreadCount + 1,
        };
        const next = [...prev];
        next.splice(idx, 1);
        return [updated, ...next];
      });
    };

    const onMessageNew = (payload: {
      conversationId: string;
      message: { inviteToken?: string | null };
    }) => {
      if (!payload.message.inviteToken) return;
      setTab("DM");
      loadConversations("DM").catch(console.error);
    };

    const onReconnect = () => {
      loadConversations().catch(console.error);
    };

    socket.on("conversation:updated", onConversationUpdated);
    socket.on("message:new", onMessageNew);
    socket.on("connect", onReconnect);

    return () => {
      socket.off("conversation:updated", onConversationUpdated);
      socket.off("message:new", onMessageNew);
      socket.off("connect", onReconnect);
    };
  }, [currentUserId, activeConversationId, loadConversations]);

  const createGroup = async () => {
    setLoading(true);
    try {
      const conv = await apiFetch<{ id: string }>("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ name: groupName }),
      });
      setGroupDialogOpen(false);
      setGroupName("");
      router.push(`/chats/${conv.id}`);
      onNavigate?.();
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const users = await apiFetch<UserResult[]>(
      `/api/users/search?q=${encodeURIComponent(q)}`,
    );
    setSearchResults(users);
  };

  const startDm = async (targetUserId: string) => {
    setLoading(true);
    try {
      const conv = await apiFetch<{ id: string }>("/api/dm", {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      });
      setDmDialogOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      router.push(`/chats/${conv.id}`);
      onNavigate?.();
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (conv: ConversationItem) => {
    if (conv.type === "DM") return conv.peer?.name ?? "แชทส่วนตัว";
    return conv.name ?? "ห้องกลุ่ม";
  };

  const getSubtitle = (conv: ConversationItem) => {
    const preview = conv.lastMessage?.content ?? "ยังไม่มีข้อความ";
    if (conv.type === "GROUP" && conv.memberCount != null) {
      return `สมาชิก ${conv.memberCount} คน · ${preview}`;
    }
    return preview;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          minHeight: 44,
          px: 1.5,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            minHeight: 44,
            color: "text.secondary",
          },
          "& .Mui-selected": {
            color: "primary.main",
          },
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        }}
      >
        <Tab label="กลุ่ม" value="GROUP" />
        <Tab label="ส่วนตัว" value="DM" />
      </Tabs>

      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={() =>
            tab === "GROUP" ? setGroupDialogOpen(true) : setDmDialogOpen(true)
          }
        >
          {tab === "GROUP" ? "สร้างห้องกลุ่ม" : "แชทใหม่"}
        </Button>
      </Box>

      <List sx={chatListSx}>
        {listLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {error && (
          <Typography color="error" sx={{ p: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}
        {!listLoading && conversations.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
            ยังไม่มีแชท
          </Typography>
        )}
        {conversations.map((conv) => (
          <ListItemButton
            key={conv.id}
            selected={conv.id === activeConversationId}
            className={conv.unreadCount > 0 ? "Mui-unread" : undefined}
            onClick={() => {
              router.push(`/chats/${conv.id}`);
              onNavigate?.();
            }}
            sx={chatListItemSx}
          >
            <ListItemAvatar sx={{ minWidth: 48, mt: 0.25 }}>
              <UnreadBadge count={conv.unreadCount}>
                {conv.type === "GROUP" ? (
                  <Avatar
                    sx={{
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                      color: "primary.main",
                      fontWeight: 700,
                    }}
                  >
                    <GroupIcon fontSize="small" />
                  </Avatar>
                ) : (
                  <UserAvatar
                    name={conv.peer?.name}
                    avatarUrl={conv.peer?.avatarUrl}
                    size={40}
                  />
                )}
              </UnreadBadge>
            </ListItemAvatar>
            <ListItemText
              primary={getTitle(conv)}
              secondary={getSubtitle(conv)}
              slotProps={{
                primary: {
                  sx: {
                    fontWeight: conv.unreadCount > 0 ? 700 : 600,
                    fontSize: "0.9rem",
                    color: "text.primary",
                  },
                },
                secondary: {
                  noWrap: true,
                  sx: {
                    fontSize: "0.8rem",
                    color: "text.secondary",
                    fontWeight: conv.unreadCount > 0 ? 500 : 400,
                  },
                },
              }}
            />
            {conv.type === "DM" && (
              <OnlineIndicator online={conv.peer?.isOnline} />
            )}
          </ListItemButton>
        ))}
      </List>

      <Dialog
        open={groupDialogOpen}
        onClose={() => setGroupDialogOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: `${CHAT_PANEL_RADIUS}px` } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>สร้างห้องกลุ่ม</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="ชื่อห้อง"
            fullWidth
            margin="dense"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setGroupDialogOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={createGroup} disabled={loading || !groupName.trim()}>
            สร้าง
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dmDialogOpen}
        onClose={() => setDmDialogOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: `${CHAT_PANEL_RADIUS}px` } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>เริ่มแชทส่วนตัว</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="ค้นหาชื่อหรืออีเมล"
            fullWidth
            margin="dense"
            value={searchQuery}
            onChange={(e) => searchUsers(e.target.value)}
          />
          <List>
            {searchResults.map((user) => (
              <ListItemButton
                key={user.id}
                onClick={() => startDm(user.id)}
                sx={{ borderRadius: 2 }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {user.name[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.name} secondary={user.email} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDmDialogOpen(false)}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
