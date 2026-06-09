import Link from "next/link";
import Box from "@mui/material/Box";
import TalktoLogoImage from "@/components/TalktoLogoImage";

export default function ChatBrandLogo({ href = "/chats" }: { href?: string }) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TalktoLogoImage height={44} />
    </Box>
  );
}
