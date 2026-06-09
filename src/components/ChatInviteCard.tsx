"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import GroupIcon from "@mui/icons-material/Group";
import { alpha } from "@mui/material/styles";
import { apiFetch } from "@/lib/api-client";
import { CHAT_ACTION_RADIUS } from "@/theme/chat/surfaces";

type InviteDetail = {
  inviteType: "GROUP" | "DM";
  conversation: { id: string; name: string | null; memberCount: number } | null;
  inviter: { name: string };
  expiresAt: string;
  isValid: boolean;
};

export default function ChatInviteCard({
  inviteToken,
  isOwn,
}: {
  inviteToken: string;
  isOwn: boolean;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<InviteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    apiFetch<InviteDetail>(`/api/invites/${inviteToken}`)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : "โหลดคำเชิญไม่สำเร็จ"))
      .finally(() => setLoading(false));
  }, [inviteToken]);

  const accept = async () => {
    setAccepting(true);
    setError("");
    try {
      const result = await apiFetch<{ redirectUrl: string }>(
        `/api/invites/${inviteToken}/accept`,
        { method: "POST" },
      );
      setAccepted(true);
      router.push(result.redirectUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เข้าร่วมไม่สำเร็จ");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
        <CircularProgress size={22} />
      </Box>
    );
  }

  const groupName = detail?.conversation?.name ?? "กลุ่ม";

  return (
    <Box
      sx={{
        minWidth: 220,
        p: 1.5,
        borderRadius: `${CHAT_ACTION_RADIUS}px`,
        border: 1,
        borderColor: (t) => alpha(t.palette.primary.main, 0.2),
        bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <GroupIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          คำเชิญเข้ากลุ่ม
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1, py: 0 }}>
          {error}
        </Alert>
      )}

      {detail && (
        <>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            {isOwn
              ? `คุณเชิญเข้าห้อง "${groupName}"`
              : `${detail.inviter.name} เชิญคุณเข้าห้อง "${groupName}"`}
          </Typography>
          {detail.conversation && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
              สมาชิก {detail.conversation.memberCount} คน
            </Typography>
          )}

          {isOwn ? (
            <Typography variant="caption" color="text.secondary">
              รอผู้รับกดเข้าร่วม
            </Typography>
          ) : accepted ? (
            <Typography variant="caption" color="success.main">
              เข้าร่วมแล้ว
            </Typography>
          ) : !detail.isValid ? (
            <Alert severity="warning" sx={{ py: 0 }}>
              คำเชิญหมดอายุหรือใช้แล้ว
            </Alert>
          ) : (
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={accept}
              disabled={accepting}
            >
              {accepting ? "กำลังเข้าร่วม..." : "เข้าร่วมกลุ่ม"}
            </Button>
          )}
        </>
      )}
    </Box>
  );
}
