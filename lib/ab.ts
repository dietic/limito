"use client";
import { useEffect, useState } from "react";

type Variant = string;

function readOverride(name: string): string | null {
  if (typeof window === "undefined") return null;
  const param = new URLSearchParams(window.location.search).get(`ab_${name}`);
  return param;
}

function readStored(name: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`ab:${name}`);
  } catch {
    return null;
  }
}

function storeVariant(name: string, variant: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`ab:${name}`, variant);
  } catch {}
}

export function getRandomVariant(variants: Variant[]): Variant {
  if (!variants.length) return "default";
  const idx = Math.floor(Math.random() * variants.length);
  return variants[idx] ?? "default";
}

export function useAbVariant(
  name: string,
  variants: Variant[],
  defaultVariant: Variant = variants[0] ?? "default"
): Variant {
  const [variant, setVariant] = useState<Variant>(defaultVariant);

  // Resolve on client after mount to avoid hydration mismatch
  useEffect(() => {
    const override = readOverride(name);
    if (override && variants.includes(override)) {
      setVariant(override);
      storeVariant(name, override);
      return;
    }
    const fromStore = readStored(name);
    if (fromStore && variants.includes(fromStore)) {
      setVariant(fromStore);
      return;
    }
    const picked = getRandomVariant(variants);
    setVariant(picked);
    storeVariant(name, picked);
  }, [name, variants]);

  return variant;
}
