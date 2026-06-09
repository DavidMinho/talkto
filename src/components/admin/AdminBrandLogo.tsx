import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TalktoLogoImage from "@/components/TalktoLogoImage";

export default function AdminBrandLogo({
  href = "/admin",
  compact = false,
}: {
  href?: string;
  compact?: boolean;
}) {
  const logoHeight = compact ? 36 : 44;

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <TalktoLogoImage height={logoHeight} />
      {!compact && (
        <Typography
          variant="caption"
          sx={{ color: "secondary.main", fontWeight: 600, letterSpacing: "0.04em" }}
        >
          ADMIN
        </Typography>
      )}
    </Box>
  );
}
