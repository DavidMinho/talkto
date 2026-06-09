"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ForumIcon from "@mui/icons-material/Forum";
import { alpha } from "@mui/material/styles";
import { adminIconBadgeSx } from "@/theme/admin/surfaces";
import { useChatShell } from "./ChatShellContext";

export default function ChatEmptyState() {
  const { openSidebar, isMobile } = useChatShell();

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 3, md: 4 },
        minHeight: 0,
        bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
      }}
    >
      <Box
        sx={{
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ ...adminIconBadgeSx, width: 56, height: 56, mb: 2 }}>
          <ForumIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          เริ่มสนทนาได้เลย
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
          เลือกแชทจากรายการด้านซ้าย
          <br />
          หรือสร้างห้องกลุ่ม / แชทส่วนตัวใหม่
        </Typography>
        {isMobile && (
          <Button variant="contained" onClick={openSidebar}>
            เปิดรายการแชท
          </Button>
        )}
      </Box>
    </Box>
  );
}
