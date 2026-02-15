import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { orderFeedbackSchema } from "@/lib/schemas";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const parsed = orderFeedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const order = await prisma.order.update({
    where: { id },
    data: {
      testimonialConsent: parsed.data.testimonialConsent,
      feedbackRating: parsed.data.feedbackRating,
      feedbackText: parsed.data.feedbackText,
    },
  });

  return NextResponse.json({
    id: order.id,
    testimonialConsent: order.testimonialConsent,
    feedbackRating: order.feedbackRating,
    feedbackText: order.feedbackText,
  });
}
