import Typography from "@mui/material/Typography";

export default function TypingIndicator({
  userName,
}: {
  userName: string | null;
}) {
  if (!userName) return null;

  return (
    <Typography
      variant="caption"
      sx={{
        px: 2.5,
        py: 0.75,
        color: "secondary.dark",
        fontWeight: 500,
        fontStyle: "italic",
      }}
    >
      {userName} กำลังพิมพ์...
    </Typography>
  );
}
