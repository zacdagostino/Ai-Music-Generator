import { NextResponse } from "next/server";

import { trackServerEvent } from "@/lib/analytics/events";

export async function POST(req: Request) {
  const { event, payload } = await req.json();

  if (!event) return NextResponse.json({ error: "event required" }, { status: 400 });

  await trackServerEvent(event, payload);
  return NextResponse.json({ ok: true });
}
