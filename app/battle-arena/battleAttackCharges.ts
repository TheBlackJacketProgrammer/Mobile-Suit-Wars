import type { MSActionHover } from "./types";

export type UnitAttackCharges = {
  basic: number;
  skill1: number;
  skill2: number;
  skill3: number;
  cdSkill1: number;
  cdSkill2: number;
  cdSkill3: number;
};

export const MAX_BASIC = 10;
export const MAX_SKILL1 = 3;
export const MAX_SKILL2 = 2;
export const MAX_SKILL3 = 1;

export const CD_SKILL1_TURNS = 3;
export const CD_SKILL2_TURNS = 5;
export const CD_SKILL3_TURNS = 10;

export function createInitialAttackCharges(): UnitAttackCharges {
  return {
    basic: MAX_BASIC,
    skill1: MAX_SKILL1,
    skill2: MAX_SKILL2,
    skill3: MAX_SKILL3,
    cdSkill1: 0,
    cdSkill2: 0,
    cdSkill3: 0,
  };
}

export function maxForAction(action: MSActionHover): number {
  switch (action) {
    case "basic":
      return MAX_BASIC;
    case "skill1":
      return MAX_SKILL1;
    case "skill2":
      return MAX_SKILL2;
    case "skill3":
      return MAX_SKILL3;
    default:
      return 0;
  }
}

export function chargesLeft(c: UnitAttackCharges, action: MSActionHover): number {
  switch (action) {
    case "basic":
      return c.basic;
    case "skill1":
      return c.skill1;
    case "skill2":
      return c.skill2;
    case "skill3":
      return c.skill3;
    default:
      return 0;
  }
}

export function canUseAction(c: UnitAttackCharges, action: MSActionHover): boolean {
  return chargesLeft(c, action) > 0;
}

/** Returns next state or null if that action has no charges left. */
export function consumeCharge(
  c: UnitAttackCharges,
  action: MSActionHover,
): UnitAttackCharges | null {
  if (!canUseAction(c, action)) return null;
  const next: UnitAttackCharges = { ...c };
  switch (action) {
    case "basic":
      next.basic -= 1;
      break;
    case "skill1":
      next.skill1 -= 1;
      if (next.skill1 === 0) next.cdSkill1 = CD_SKILL1_TURNS;
      break;
    case "skill2":
      next.skill2 -= 1;
      if (next.skill2 === 0) next.cdSkill2 = CD_SKILL2_TURNS;
      break;
    case "skill3":
      next.skill3 -= 1;
      if (next.skill3 === 0) next.cdSkill3 = CD_SKILL3_TURNS;
      break;
  }
  return next;
}

/**
 * Apply end-of-round recharge: skill cooldowns tick down and refill at 0;
 * basic gains +1 when empty (up to max).
 */
export function advanceRoundCooldowns(c: UnitAttackCharges): UnitAttackCharges {
  const next: UnitAttackCharges = { ...c };

  if (next.cdSkill1 > 0) {
    next.cdSkill1 -= 1;
    if (next.cdSkill1 === 0) next.skill1 = MAX_SKILL1;
  }
  if (next.cdSkill2 > 0) {
    next.cdSkill2 -= 1;
    if (next.cdSkill2 === 0) next.skill2 = MAX_SKILL2;
  }
  if (next.cdSkill3 > 0) {
    next.cdSkill3 -= 1;
    if (next.cdSkill3 === 0) next.skill3 = MAX_SKILL3;
  }

  if (next.basic === 0) {
    next.basic = Math.min(MAX_BASIC, next.basic + 1);
  }

  return next;
}

export function advanceAllUnitCharges(
  units: UnitAttackCharges[],
): UnitAttackCharges[] {
  return units.map(advanceRoundCooldowns);
}

/** Short label for the Cooldown row in MSStats (hover or list). */
export function formatCooldownDisplay(
  c: UnitAttackCharges,
  action: MSActionHover,
): string {
  if (chargesLeft(c, action) > 0) return "—";
  if (action === "basic") return "+1 / round";
  const cd =
    action === "skill1"
      ? c.cdSkill1
      : action === "skill2"
        ? c.cdSkill2
        : c.cdSkill3;
  return cd > 0 ? `${cd} turn(s)` : "—";
}
