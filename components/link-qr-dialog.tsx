"use client";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { createQrSvg, encodeSvgDataUrl } from "@/lib/qr";
import { useEffect, useMemo, useState } from "react";

interface LinkQrDialogProps {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GenerationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; svg: string; svgDataUrl: string; pngDataUrl: string }
  | { status: "error"; message: string };

const DISPLAY_SIZE = 320;
const EXPORT_SIZE = 640;
const QR_CELL_SIZE = 8; // Reduced from 12 to fit better
const QR_MARGIN = 2;

export function LinkQrDialog({ slug, open, onOpenChange }: LinkQrDialogProps) {
  const { toast } = useToast();
  const [state, setState] = useState<GenerationState>({ status: "idle" });
  const [copying, setCopying] = useState(false);

  const targetUrl = useMemo(() => buildTargetUrl(slug), [slug]);

  useEffect(() => {
    if (!open) {
      setState({ status: "idle" });
      setCopying(false);
      return;
    }
    setState({ status: "loading" });
    let canceled = false;
    const run = async () => {
      try {
        const { svg } = createQrSvg(targetUrl, {
          margin: QR_MARGIN,
          cellSize: QR_CELL_SIZE,
          errorCorrectionLevel: "H",
        });
        if (canceled) return;
        const svgDataUrl = encodeSvgDataUrl(svg);
        const pngDataUrl = await svgToPngDataUrl(svg, EXPORT_SIZE);
        if (canceled) return;
        setState({ status: "ready", svg, svgDataUrl, pngDataUrl });
      } catch (error) {
        if (canceled) return;
        const message =
          error instanceof Error ? error.message : "Failed to generate QR";
        setState({ status: "error", message });
      }
    };
    void run();
    return () => {
      canceled = true;
    };
  }, [open, targetUrl]);

  const handleDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyImage = async () => {
    if (state.status !== "ready") return;
    if (!navigator.clipboard || typeof window.ClipboardItem === "undefined") {
      toast({
        title: "Clipboard unsupported",
        description: "Your browser does not support copying images yet.",
        variant: "info",
      });
      return;
    }
    setCopying(true);
    try {
      const res = await fetch(state.pngDataUrl);
      const blob = await res.blob();
      const item = new window.ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      toast({
        title: "QR copied",
        description: "PNG copied to clipboard.",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to copy image";
      toast({
        title: "Copy failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      toast({
        title: "Link copied",
        description: "Redirect URL copied to clipboard.",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to copy link";
      toast({
        title: "Copy failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>QR code ready to share</DialogTitle>
        <DialogDescription>
          Scan or download the QR code for <code>/{slug}</code>.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-5">
        {state.status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p>Generating QR code…</p>
          </div>
        )}
        {state.status === "error" && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {state.message}
          </div>
        )}
        {state.status === "ready" && (
          <>
            <div className="flex justify-center">
              <div
                className="flex items-center justify-center rounded-2xl border border-border bg-white p-5 shadow-lg"
                style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE }}
              >
                <div
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: state.svg }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Share URL
              </div>
              <div className="mt-1 truncate font-medium text-foreground">
                {targetUrl}
              </div>
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="sm:order-last"
          >
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={handleCopyUrl}
            disabled={state.status !== "ready"}
          >
            Copy link
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              state.status === "ready" &&
              handleDownload(state.svgDataUrl, `${slug}-qr.svg`)
            }
            disabled={state.status !== "ready"}
          >
            SVG
          </Button>
          <Button
            onClick={() =>
              state.status === "ready" &&
              handleDownload(state.pngDataUrl, `${slug}-qr.png`)
            }
            disabled={state.status !== "ready"}
          >
            PNG
          </Button>
          <Button
            variant="ghost"
            onClick={handleCopyImage}
            disabled={state.status !== "ready" || copying}
          >
            {copying ? "Copying…" : "Copy PNG"}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}

function buildTargetUrl(slug: string): string {
  const normalizedSlug = slug.replace(/^\/+/, "");
  if (typeof window === "undefined") {
    const base = process.env["NEXT_PUBLIC_APP_URL"] || "https://limi.to";
    return `${base.replace(/\/$/, "")}/r/${normalizedSlug}`;
  }
  const override = process.env["NEXT_PUBLIC_APP_URL"];
  const base =
    override && override.trim().length > 0 ? override : window.location.origin;
  return `${base.replace(/\/$/, "")}/r/${normalizedSlug}`;
}

async function svgToPngDataUrl(svg: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const dataUrl = encodeSvgDataUrl(svg);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const scale = window.devicePixelRatio || 1;
        const canvas = document.createElement("canvas");
        canvas.width = size * scale;
        canvas.height = size * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const png = canvas.toDataURL("image/png");
        resolve(png);
      };
      img.onerror = () => reject(new Error("Unable to render QR"));
      img.src = dataUrl;
    } catch (error) {
      reject(error instanceof Error ? error : new Error("Conversion failed"));
    }
  });
}
