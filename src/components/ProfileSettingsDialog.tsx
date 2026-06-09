"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { apiFetch } from "@/lib/api-client";
import { uploadAvatarFile } from "@/lib/upload-image";
import UserAvatar from "@/components/UserAvatar";
import { CHAT_PANEL_RADIUS } from "@/theme/chat/surfaces";

type Profile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export default function ProfileSettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: session, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    setName(session?.user?.name ?? "");
    setAvatarUrl(session?.user?.avatarUrl ?? null);

    apiFetch<Profile>("/api/users/me")
      .then((profile) => {
        setName(profile.name);
        setAvatarUrl(profile.avatarUrl);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "โหลดโปรไฟล์ไม่สำเร็จ");
      });
  }, [open, session?.user?.name, session?.user?.avatarUrl]);

  const handleAvatarSelect = async (file: File | null) => {
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const uploaded = await uploadAvatarFile(file);
      setAvatarUrl(uploaded.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("กรุณากรอกชื่อ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const profile = await apiFetch<Profile>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: trimmed,
          avatarUrl,
        }),
      });

      await update({
        user: {
          name: profile.name,
          avatarUrl: profile.avatarUrl,
        },
      });

      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: `${CHAT_PANEL_RADIUS}px` } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>แก้ไขโปรไฟล์</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ position: "relative" }}>
            <UserAvatar name={name} avatarUrl={avatarUrl} size={88} />
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{
                position: "absolute",
                right: -4,
                bottom: -4,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                "&:hover": { bgcolor: "background.default" },
              }}
            >
              {uploading ? (
                <CircularProgress size={18} />
              ) : (
                <PhotoCameraIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => handleAvatarSelect(e.target.files?.[0] ?? null)}
          />
          {avatarUrl && (
            <Button size="small" onClick={handleRemoveAvatar}>
              ลบรูปโปรไฟล์
            </Button>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            JPEG, PNG หรือ WebP ไม่เกิน 2MB
          </Typography>
        </Box>

        <TextField
          autoFocus
          label="ชื่อที่แสดง"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          slotProps={{ htmlInput: { maxLength: 80 } }}
        />

        <TextField
          label="อีเมล"
          fullWidth
          margin="normal"
          value={session?.user?.email ?? ""}
          disabled
          helperText="อีเมลไม่สามารถเปลี่ยนได้"
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading || uploading}>
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
