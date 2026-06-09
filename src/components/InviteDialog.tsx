"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { apiFetch } from "@/lib/api-client";
import { CHAT_PANEL_RADIUS } from "@/theme/chat/surfaces";

type UserResult = { id: string; name: string; email: string };

export default function InviteDialog({
  open,
  onClose,
  conversationId,
  inviteType,
}: {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  inviteType: "GROUP" | "DM";
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [error, setError] = useState("");

  const resetGroupState = () => {
    setSearchQuery("");
    setSearchResults([]);
    setError("");
  };

  const handleClose = () => {
    setUrl("");
    resetGroupState();
    onClose();
  };

  const createInvite = async () => {
    setLoading(true);
    try {
      const result = await apiFetch<{ url: string }>("/api/invites/dm", {
        method: "POST",
        body: JSON.stringify({
          inviteType: "DM",
          expiresInDays: 7,
          maxUses: 1,
        }),
      });
      setUrl(result.url);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (q: string) => {
    setSearchQuery(q);
    setError("");
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const users = await apiFetch<UserResult[]>(
        `/api/users/search?q=${encodeURIComponent(q)}`,
      );
      setSearchResults(users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ค้นหาไม่สำเร็จ");
    }
  };

  const inviteUserToGroup = async (targetUserId: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await apiFetch<{
        dmConversationId: string;
        targetUser: { name: string };
      }>(`/api/conversations/${conversationId}/invites/user`, {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      });
      handleClose();
      router.push(`/chats/${result.dmConversationId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งคำเชิญไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setSnackOpen(true);
  };

  if (inviteType === "GROUP") {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: `${CHAT_PANEL_RADIUS}px` } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>เชิญเข้าห้องกลุ่ม</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            ค้นหาชื่อหรืออีเมลของคนที่ต้องการเชิญ ระบบจะส่งคำเชิญไปในแชทส่วนตัว
          </Alert>
          <TextField
            autoFocus
            label="ค้นหาชื่อหรืออีเมล"
            fullWidth
            value={searchQuery}
            onChange={(e) => searchUsers(e.target.value)}
            disabled={loading}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1.5 }}>
              {error}
            </Typography>
          )}
          <List>
            {searchResults.map((user) => (
              <ListItemButton
                key={user.id}
                onClick={() => inviteUserToGroup(user.id)}
                disabled={loading}
                sx={{ borderRadius: 2, mt: 0.5 }}
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
          {searchQuery.length >= 2 && searchResults.length === 0 && !loading && (
            <Typography color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>
              ไม่พบผู้ใช้
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>ปิด</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: `${CHAT_PANEL_RADIUS}px` } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>เชิญแชทส่วนตัว</DialogTitle>
        <DialogContent>
          {!url ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              สร้างลิงก์เชิญที่หมดอายุใน 7 วัน
            </Alert>
          ) : (
            <TextField
              fullWidth
              label="ลิงก์เชิญ"
              value={url}
              slotProps={{ input: { readOnly: true } }}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>ปิด</Button>
          {!url ? (
            <Button variant="contained" onClick={createInvite} disabled={loading}>
              สร้างลิงก์
            </Button>
          ) : (
            <Button variant="contained" onClick={copyLink}>
              คัดลอก
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message="คัดลอกลิงก์แล้ว"
      />
    </>
  );
}
