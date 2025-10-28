import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LinkCard from "@/components/link-card";
import type { Link } from "@/types/link";

const mockLinkQrDialog = vi.fn((props: unknown) => props);
const mockUpgradeDialog = vi.fn((props: unknown) => props);

vi.mock("@/components/link-qr-dialog", () => ({
  LinkQrDialog: (props: unknown) => {
    mockLinkQrDialog(props);
    return null;
  },
}));

vi.mock("@/components/upgrade-prompt-dialog", () => ({
  UpgradePromptDialog: (props: unknown) => {
    mockUpgradeDialog(props);
    return null;
  },
}));

vi.mock("@/hooks/use-link-analytics", () => ({
  useLinkAnalytics: () => ({ data: null }),
}));

const baseLink: Link = {
  id: "1",
  owner_id: "user",
  slug: "sample",
  destination_url: "https://example.com",
  fallback_url: null,
  mode: "by_date",
  expires_at: null,
  click_limit: null,
  click_count: 0,
  last_clicked_at: null,
  is_active: true,
  current_activation_id: null,
};

describe("LinkCard QR access", () => {
  beforeEach(() => {
    mockLinkQrDialog.mockClear();
    mockUpgradeDialog.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("opens the QR dialog for Plus users", () => {
    render(
      <LinkCard
        link={baseLink}
        onCopy={() => {}}
        onDelete={() => {}}
        plan="plus"
        planLoading={false}
      />
    );

    const button = screen.getByRole("button", { name: /QR code/i });
    fireEvent.click(button);

    const lastCall = mockLinkQrDialog.mock.calls.at(-1);
    expect(lastCall).toBeTruthy();
    const lastProps = lastCall?.[0] as { open: boolean } | undefined;
    expect(lastProps?.open).toBe(true);
  });

  it("gates the QR dialog for Free users", () => {
    render(
      <LinkCard
        link={baseLink}
        onCopy={() => {}}
        onDelete={() => {}}
        plan="free"
        planLoading={false}
      />
    );

    const button = screen.getByRole("button", { name: /Unlock QR/i });
    fireEvent.click(button);

    const lastUpgradeCall = mockUpgradeDialog.mock.calls.at(-1);
    expect(lastUpgradeCall).toBeTruthy();
    const upgradeProps = lastUpgradeCall?.[0] as { open: boolean } | undefined;
    expect(upgradeProps?.open).toBe(true);

    const lastQrCall = mockLinkQrDialog.mock.calls.at(-1);
    expect(lastQrCall).toBeTruthy();
    const qrProps = lastQrCall?.[0] as { open: boolean } | undefined;
    expect(qrProps?.open).toBe(false);
  });
});
