"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import TalktoLogoImage from "@/components/TalktoLogoImage";
import { apiFetch } from "@/lib/api-client";

type Mode = "login" | "register";

function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/chats";
  }
  return raw;
}

function AuthFormInner({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const isAdminLogin =
    callbackUrl === "/admin" || callbackUrl.startsWith("/admin/");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await apiFetch("/api/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "Configuration") {
          setError("เซิร์ฟเวอร์ตั้งค่าไม่ครบ (NEXTAUTH_SECRET / DATABASE_URL) — รอ redeploy หรือติดต่อผู้ดูแล");
          return;
        }
        setError(mode === "login" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : "ล็อกอินไม่สำเร็จหลังสมัคร");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

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
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
            <TalktoLogoImage height={40} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Talkto
            </Typography>
          </Box>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {mode === "login"
              ? isAdminLogin
                ? "เข้าสู่ระบบผู้ดูแล (Admin)"
                : "เข้าสู่ระบบ"
              : "สมัครสมาชิก"}
          </Typography>

          {isAdminLogin && mode === "login" && (
            <Alert severity="info" sx={{ mb: 2 }}>
              ใช้บัญชีที่มีสิทธิ์ ADMIN หรือตั้ง{" "}
              <code>ADMIN_EMAILS</code> ในไฟล์ <code>.env</code> แล้วล็อกอินใหม่
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <TextField
                label="ชื่อ"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <TextField
              label="อีเมล"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="รหัสผ่าน"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText={mode === "register" ? "อย่างน้อย 8 ตัวอักษร" : undefined}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading
                ? "กำลังดำเนินการ..."
                : mode === "login"
                  ? "ล็อกอิน"
                  : "สมัครสมาชิก"}
            </Button>
          </Box>

          <Typography sx={{ mt: 2, textAlign: "center" }}>
            {mode === "login" ? (
              <>
                ยังไม่มีบัญชี?{" "}
                <Link component={NextLink} href="/register">
                  สมัครสมาชิก
                </Link>
              </>
            ) : (
              <>
                มีบัญชีแล้ว?{" "}
                <Link component={NextLink} href="/login">
                  ล็อกอิน
                </Link>
              </>
            )}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function AuthForm({ mode }: { mode: Mode }) {
  return (
    <Suspense fallback={null}>
      <AuthFormInner mode={mode} />
    </Suspense>
  );
}
