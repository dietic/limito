/**
 * QR code generation helpers for client-side rendering.
 */
import QRCode from "qrcode-generator";

export type QrErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface CreateQrSvgOptions {
  errorCorrectionLevel?: QrErrorCorrectionLevel;
  margin?: number;
  cellSize?: number;
}

export interface QrSvgResult {
  svg: string;
  size: number;
  moduleCount: number;
}

const DEFAULT_ECL: QrErrorCorrectionLevel = "H";
const DEFAULT_MARGIN = 2;
const DEFAULT_CELL_SIZE = 12;

export function createQrSvg(
  value: string,
  options: CreateQrSvgOptions = {}
): QrSvgResult {
  if (!value || !value.trim()) {
    throw new Error("QR value must be a non-empty string");
  }

  const {
    errorCorrectionLevel = DEFAULT_ECL,
    margin = DEFAULT_MARGIN,
    cellSize = DEFAULT_CELL_SIZE,
  } = options;

  const qr = QRCode(0, errorCorrectionLevel);
  qr.addData(value);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const svgTag = qr.createSvgTag({
    cellSize,
    margin,
    scalable: true,
  });

  const size = (moduleCount + margin * 2) * cellSize;
  const sanitizedSvg = injectAccessibilityAttributes(svgTag, size);

  return { svg: sanitizedSvg, size, moduleCount };
}

export function encodeSvgDataUrl(svg: string): string {
  if (typeof svg !== "string" || svg.trim().length === 0) {
    throw new Error("SVG content must be a non-empty string");
  }
  const encoded =
    typeof window === "undefined"
      ? Buffer.from(svg).toString("base64")
      : window.btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}

function injectAccessibilityAttributes(svg: string, size: number): string {
  if (!svg.includes("<svg")) return svg;
  // Replace the opening SVG tag with explicit dimensions and proper attributes
  return svg.replace(/<svg[^>]*>/, (match) => {
    // Extract viewBox if present, or construct from size
    const viewBoxMatch = match.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${size} ${size}`;
    // Use explicit width/height in pixels for both display and Image rendering
    return `<svg role="img" aria-hidden="true" focusable="false" shape-rendering="crispEdges" width="${size}" height="${size}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`;
  });
}
