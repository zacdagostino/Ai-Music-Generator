import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/schemas";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { answers, email, eventType } = parsed.data;
  const baseSlug = slugify(answers.honoreeName || "memory");

  const order = await prisma.order.create({
    data: {
      email,
      eventType,
      answersJson: answers,
      status: OrderStatus.AWAITING_PAYMENT,
      slug: `${baseSlug}-${Date.now().toString().slice(-5)}`,
      shareToken: uuidv4(),
    },
  });

  return NextResponse.json(order);
}
