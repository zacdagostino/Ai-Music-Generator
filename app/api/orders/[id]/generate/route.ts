import { NextResponse } from "next/server";

import { runGenerationPipeline } from "@/lib/services/generation";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  runGenerationPipeline(id).catch((error: unknown) => {
    console.error("generation failed", id, error);
  });

  return NextResponse.json({ started: true });
}
