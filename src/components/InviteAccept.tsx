"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { apiFetch } from "@/lib/api-client";

type InviteDetail = {
  inviteType: "GROUP" | "DM";
  conversation: { id: string; name: string | null; memberCount: number } | null;
  inviter: { name: string };
  expiresAt: string;
  isValid: boolean;
};

export default function InviteAccept({
  token,
  label,
}: {
  token: string;
  label: string;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<InviteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<InviteDetail>(`/api/invites/${token}`)
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const accept = async () => {
    setAccepting(true);
    try {
      const result = await apiFetch<{ redirectUrl: string }>(
        `/api/invites/${token}/accept`,
        { method: "POST" },
      );
      router.push(result.redirectUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ยอมรับไม่สำเร็จ");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            {label}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {detail && (
            <>
              <Typography sx={{ mb: 1 }}>
                {detail.inviter.name} เชิญคุณ
                {detail.conversation
                  ? ` เข้าห้อง "${detail.conversation.name ?? "กลุ่ม"}"`
                  : " แชทส่วนตัว"}
              </Typography>
              {detail.conversation && (
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  สมาชิก {detail.conversation.memberCount} คน
                </Typography>
              )}
              {!detail.isValid ? (
                <Alert severity="warning">ลิงก์นี้หมดอายุหรือใช้ครบแล้ว</Alert>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={accept}
                  disabled={accepting}
                >
                  {accepting ? "กำลังเข้าร่วม..." : "เข้าร่วม"}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
