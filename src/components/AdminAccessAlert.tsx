"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

export default function AdminAccessAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const showAlert = !dismissed && searchParams.get("error") === "not_admin";

  if (!showAlert) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Alert
        severity="warning"
        onClose={() => {
          setDismissed(true);
          router.replace("/chats");
        }}
      >
        บัญชีนี้ยังไม่มีสิทธิ์ Admin — ตั้ง{" "}
        <code>ADMIN_EMAILS=อีเมลของคุณ</code> ในไฟล์ <code>.env</code> แล้วล็อกอินใหม่
        หรือรัน <code>npm run db:promote-admin -- อีเมลของคุณ</code>
      </Alert>
    </Box>
  );
}
