"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InsightsIcon from "@mui/icons-material/Insights";
import { adminSoftCardSx, adminIconBadgeSx } from "@/theme/admin/surfaces";

type InsightRow = {
  label: string;
  value: string;
  progress?: number;
  highlight?: boolean;
};

export default function AdminInsightsCard({ rows }: { rows: InsightRow[] }) {
  return (
    <Paper sx={adminSoftCardSx}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2.5 }}>
        <Box sx={adminIconBadgeSx}>
          <InsightsIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            ภาพรวมระบบ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            สถิติสำคัญของแพลตฟอร์ม
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2}>
        {rows.map((row) => (
          <Box key={row.label}>
            <Stack direction="row" sx={{ mb: 0.5, justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                {row.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: row.highlight ? "secondary.main" : "text.primary",
                }}
              >
                {row.value}
              </Typography>
            </Stack>
            {row.progress != null && (
              <LinearProgress
                variant="determinate"
                value={row.progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    bgcolor: row.highlight ? "secondary.main" : "primary.main",
                  },
                }}
              />
            )}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
