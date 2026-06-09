"use client";

import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { SvgIconComponent } from "@mui/icons-material";
import { adminStatCardSx } from "@/theme/admin/surfaces";

type Stat = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: SvgIconComponent;
};

export default function AdminStatsCards({ stats }: { stats: Stat[] }) {
  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper sx={adminStatCardSx}>
              {Icon && (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                  }}
                >
                  <Icon sx={{ fontSize: 22 }} />
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {stat.title}
              </Typography>
              <Typography
                variant="h4"
                sx={{ mt: 1, mb: 0.5, fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                {stat.value}
              </Typography>
              {stat.subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {stat.subtitle}
                </Typography>
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
