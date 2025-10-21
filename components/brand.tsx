"use client";
import Image from "next/image";

type BrandProps = {
  height?: number; // pixel height, width auto
  className?: string;
  priority?: boolean;
};

const image = await import("/public/logo.png");

export default function Brand({
  height = 24,
  className = "",
  priority = false,
}: BrandProps) {
  const width = Math.round((height / 28) * 120); // maintain approx wordmark ratio
  return (
    <div className={className} aria-label="Limi.to">
      <Image
        src={image}
        alt="Limi.to"
        width={width}
        height={height}
        className="h-auto w-auto"
        priority={priority}
      />
    </div>
  );
}
