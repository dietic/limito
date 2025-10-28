"use client";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface UpgradePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradePromptDialog({
  open,
  onOpenChange,
}: UpgradePromptDialogProps) {
  const router = useRouter();

  const navigateTo = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Upgrade to unlock QR codes</DialogTitle>
        <DialogDescription>
          QR codes are available on Plus and Pro plans. Upgrade to remove the
          lock instantly.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Upgrading gets you high-resolution QR codes with copy and download
          options, higher link limits, and faster redirects.
        </p>
        <p>
          Already on Plus or Pro? Refresh after upgrading and re-open this
          dialog.
        </p>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Maybe later
        </Button>
        <Button variant="secondary" onClick={() => navigateTo("/pricing")}>
          View plans
        </Button>
        <Button onClick={() => navigateTo("/pricing?upgrade=plus")}>
          Upgrade to Plus
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
