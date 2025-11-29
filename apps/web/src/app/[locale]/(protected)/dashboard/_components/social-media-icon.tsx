import Image from "next/image";
import type { ComponentProps } from "react";

type SocialMediaPlatform = "tiktok" | "instagram" | "facebook" | "youtube";

interface SocialMediaIconProps extends Omit<ComponentProps<typeof Image>, "src" | "alt"> {
  platform: SocialMediaPlatform;
}

const platformConfig: Record<
  SocialMediaPlatform,
  { src: string; alt: string }
> = {
  tiktok: {
    src: "/icons/tiktok.svg",
    alt: "TikTok",
  },
  instagram: {
    src: "/icons/instagram.svg",
    alt: "Instagram",
  },
  facebook: {
    src: "/icons/facebook.svg",
    alt: "Facebook",
  },
  youtube: {
    src: "/icons/youtube.svg",
    alt: "YouTube",
  },
};

export function SocialMediaIcon({
  platform,
  width = 20,
  height = 20,
  className,
  ...props
}: SocialMediaIconProps) {
  const config = platformConfig[platform];

  return (
    <Image
      src={config.src}
      alt={config.alt}
      width={width}
      height={height}
      className={className}
      {...props}
    />
  );
}

