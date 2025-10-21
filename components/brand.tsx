"use client";
import Image from "next/image";
import logo from "../public/logo.png";

type BrandProps = {
  height?: number; // pixel height, width auto
  className?: string;
  priority?: boolean;
};

export default function Brand({
  height = 24,
  className = "",
  priority = false,
}: BrandProps) {
  const width = Math.round((height / 28) * 120); // maintain approx wordmark ratio
  return (
    <div className={className} aria-label="Limi.to">
      <Image
        src={logo}
        alt="Limi.to"
        width={width}
        height={height}
        className="h-[inherit] w-auto"
        priority={priority}
      />
    </div>
  );
}
