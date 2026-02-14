import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { runGenerationPipeline } from "@/lib/services/generation";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  runGenerationPipeline(id).catch((error: unknown) => {
    console.error("admin regeneration failed", id, error);
  });

  return NextResponse.json({ started: true });
}
