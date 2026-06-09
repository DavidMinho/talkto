import Box from "@mui/material/Box";

export default function OnlineIndicator({ online }: { online?: boolean }) {
  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        bgcolor: online ? "success.main" : "grey.500",
        border: 2,
        borderColor: "background.paper",
        flexShrink: 0,
      }}
    />
  );
}
