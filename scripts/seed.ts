import bcrypt from "bcrypt";
import { EventType, OrderStatus, Tier, UserRole } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import { prisma } from "../lib/prisma";

async function main() {
  const adminPassword = await bcrypt.hash("admin1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@heldinsong.com" },
    update: { role: UserRole.ADMIN, passwordHash: adminPassword },
    create: {
      email: "admin@heldinsong.com",
      name: "Admin",
      role: UserRole.ADMIN,
      passwordHash: adminPassword,
    },
  });

  await prisma.order.create({
    data: {
      userId: admin.id,
      email: "demo@heldinsong.com",
      eventType: EventType.IN_MEMORY,
      tier: Tier.SACRED_COMPOSITION,
      status: OrderStatus.READY,
      slug: `demo-memory-${Date.now().toString().slice(-5)}`,
      shareToken: uuidv4(),
      isPublic: true,
      answersJson: {
        honoreeName: "Evelyn",
        relationshipType: "Grandparent",
        descriptors: ["Kind", "Steady", "Playful"],
        vividMemory: "She folded letters at the kitchen table each Sunday afternoon.",
        feeling: "Peace",
        musicStyle: "Gentle piano",
      },
    },
  });

  console.log("Seed complete: admin@heldinsong.com / admin1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
