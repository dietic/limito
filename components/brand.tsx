"use client";
import Image from "next/image";

type BrandProps = {
  height?: number; // pixel height, width auto
  className?: string;
  priority?: boolean;
  responsive?: boolean; // when true: 14px on mobile, 16px on >=sm
};

export default function Brand({
  height = 16,
  className = "",
  priority = false,
  responsive = false,
}: BrandProps) {
  const width = Math.round((height / 28) * 120); // maintain approx wordmark ratio
  if (responsive) {
    const mobileH = 14;
    const mobileW = Math.round((mobileH / 28) * 120);
    return (
      <div className={className} aria-label="Limi.to">
        {/* Mobile: 14px height */}
        <Image
          src="/logo.png"
          alt="Limi.to"
          width={mobileW}
          height={mobileH}
          priority={priority}
          className="block sm:hidden"
        />
        {/* Desktop and >=sm: 16px (or provided height) */}
        <Image
          src="/logo.png"
          alt="Limi.to"
          width={width}
          height={height}
          priority={priority}
          className="hidden sm:block"
        />
      </div>
    );
  }
  return (
    <div className={className} aria-label="Limi.to">
      <Image
        src="/logo.png"
        alt="Limi.to"
        width={width}
        height={height}
        priority={priority}
      />
    </div>
  );
}
