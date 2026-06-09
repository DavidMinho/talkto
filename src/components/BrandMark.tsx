import Box from "@mui/material/Box";

export default function BrandMark({
  size = 42,
}: {
  size?: number;
}) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        background: (t) =>
          `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        flexShrink: 0,
      }}
    >
      <Box
        component="span"
        sx={{
          fontSize: size * 0.42,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.14em",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        &ldquo;&rdquo;
      </Box>
    </Box>
  );
}
