"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import "swagger-ui-react/swagger-ui.css";
import { adminSoftCardSx } from "@/theme/admin/surfaces";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function AdminDocsPage() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        API Documentation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        REST API reference สำหรับผู้ดูแลระบบ — Socket.io events ดูที่{" "}
        <Link href="/socket-events.md" target="_blank">
          socket-events.md
        </Link>
      </Typography>
      <Paper sx={{ ...adminSoftCardSx, p: 0, overflow: "hidden" }}>
        <SwaggerUI url="/api/admin/openapi" />
      </Paper>
    </Box>
  );
}
