import Image from "next/image";

export default function TalktoLogoImage({
  height = 40,
}: {
  height?: number;
}) {
  return (
    <Image
      src="/talktologo.png"
      alt="Talkto"
      width={Math.round(height * 2.2)}
      height={height}
      unoptimized
      style={{ width: "auto", height, objectFit: "contain" }}
      priority
    />
  );
}
