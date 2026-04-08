import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import type { MSActionHover } from "./types";

export function getDamageForAction(
  unit: MSLineUpUnit,
  action: MSActionHover,
): number {
  switch (action) {
    case "basic":
      return unit.basicAtkdmg;
    case "skill1":
      return unit.skill1dmg;
    case "skill2":
      return unit.skill2dmg;
    case "skill3":
      return unit.skill3dmg;
    default:
      return 0;
  }
}

export function getActionLabel(
  unit: MSLineUpUnit,
  action: MSActionHover,
): string {
  switch (action) {
    case "basic":
      return "Basic Attack";
    case "skill1":
      return unit.skill1;
    case "skill2":
      return unit.skill2;
    case "skill3":
      return unit.skill3;
    default:
      return "Attack";
  }
}
