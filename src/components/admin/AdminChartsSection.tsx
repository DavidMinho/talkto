"use client";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AdminChartCard from "./AdminChartCard";
import { adminChartColors } from "@/theme/admin/chartColors";

type MonthlyPoint = { month: string; value: number };
type BreakdownPoint = { name: string; value: number };

function MonthlyBars({ data }: { data: MonthlyPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.every((d) => d.value === 0)) {
    return (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary">
          ยังไม่มีสมาชิกใหม่ในช่วง 6 เดือนที่ผ่านมา
        </Typography>
      </Box>
    );
  }

  return (
    <Stack
      direction="row"
      sx={{ height: "100%", alignItems: "flex-end", gap: 1.5, px: 1, pb: 1 }}
    >
      {data.map((point) => (
        <Box key={point.month} sx={{ flex: 1, textAlign: "center" }}>
          <Box
            sx={{
              height: 200,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 48,
                height: `${(point.value / max) * 100}%`,
                minHeight: point.value > 0 ? 12 : 0,
                borderRadius: "10px 10px 4px 4px",
                background: `linear-gradient(180deg, ${adminChartColors.accent} 0%, ${adminChartColors.primary} 100%)`,
                transition: "height 0.3s ease",
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {point.month}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {point.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function DonutBreakdown({
  data,
  centerLabel,
  centerValue,
}: {
  data: BreakdownPoint[];
  centerLabel: string;
  centerValue: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = adminChartColors.segments;

  if (total === 0) {
    return (
      <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary">
          ยังไม่มีห้องแชท
        </Typography>
      </Box>
    );
  }

  const segments = data.reduce<
    Array<(typeof data)[number] & { pct: number; color: string; offset: number }>
  >((acc, item, i) => {
    const pct = (item.value / total) * 100;
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].pct : 0;
    acc.push({ ...item, pct, color: colors[i % colors.length], offset });
    return acc;
  }, []);

  const gradient = segments
    .map((s) => `${s.color} ${s.offset}% ${s.offset + s.pct}%`)
    .join(", ");

  return (
    <Stack direction="row" sx={{ height: "100%", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          position: "relative",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `conic-gradient(${gradient})`,
          flexShrink: 0,
          mx: "auto",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "22%",
            borderRadius: "50%",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {centerValue}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {centerLabel}
          </Typography>
        </Box>
      </Box>
      <Stack spacing={1.5} sx={{ flex: 1 }}>
        {segments.map((item) => (
          <Stack key={item.name} direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: item.color,
              }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {item.name}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.value}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

export default function AdminChartsSection({
  monthlySignups,
  conversationTypeBreakdown,
  totalConversations,
}: {
  monthlySignups: MonthlyPoint[];
  conversationTypeBreakdown: BreakdownPoint[];
  totalConversations: number;
}) {
  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <AdminChartCard
          title="สมาชิกใหม่"
          subtitle="จำนวนสมัครสมาชิกรายเดือน 6 เดือนล่าสุด"
          height={260}
        >
          <MonthlyBars data={monthlySignups} />
        </AdminChartCard>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <AdminChartCard
          title="ประเภทห้องแชท"
          subtitle="แยกตามกลุ่มและส่วนตัว"
          height={260}
        >
          <DonutBreakdown
            data={conversationTypeBreakdown}
            centerLabel="ห้องทั้งหมด"
            centerValue={totalConversations}
          />
        </AdminChartCard>
      </Grid>
    </Grid>
  );
}
