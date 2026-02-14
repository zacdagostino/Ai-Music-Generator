import { Tier } from "@prisma/client";

import { ADD_ONS, TIERS } from "@/lib/constants";

export function computeOrderTotal(tier: Tier, addOns: string[]) {
  const tierPrice = TIERS[tier].price;
  const addOnTotal = ADD_ONS.filter((addOn) => addOns.includes(addOn.key)).reduce(
    (sum, item) => sum + item.price,
    0,
  );

  return {
    tierPrice,
    addOnTotal,
    total: tierPrice + addOnTotal,
  };
}
