import Image from "next/image";

import { initials } from "@/lib/domain/profile";

type AvatarProps = {
  name: string;
  url: string | null;
  size?: number;
};

/** Decorative: the name is always shown next to it, so it has no alt text. */
export function Avatar({ name, url, size = 48 }: AvatarProps) {
  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={size}
        height={size}
        className="rounded-full border border-neutral-300"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-neutral-800 font-semibold text-white"
    >
      {initials(name)}
    </span>
  );
}
