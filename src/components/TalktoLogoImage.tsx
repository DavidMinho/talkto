import Image from "next/image";
import talktoLogo from "@/talktologo.png";

export default function TalktoLogoImage({
  height = 40,
}: {
  height?: number;
}) {
  return (
    <Image
      src={talktoLogo}
      alt="Talkto"
      height={height}
      style={{ width: "auto", height, objectFit: "contain" }}
      priority
    />
  );
}
