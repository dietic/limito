import { NextResponse } from "next/server";

export async function GET() {
  // Tiny health endpoint for uptime checks
  return NextResponse.json({ ok: true, ts: Date.now() });
}
