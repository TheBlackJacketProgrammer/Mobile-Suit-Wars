import type { BattleLogPart } from "./battleLog";

const COST_REFERENCE = 8000;

const BASE_CRIT_CHANCE = 0.06;
const MAX_CRIT_CHANCE = 0.34;
const CRIT_BONUS_AT_FULL_COST = 0.24;

const BASE_EVADE_CHANCE = 0.06;
const MAX_EVADE_CHANCE = 0.3;
const EVADE_BONUS_AT_FULL_COST = 0.22;

export const CRIT_DAMAGE_MULTIPLIER = 1.75;

export type AttackOutcome = {
  finalDamage: number;
  evaded: boolean;
  critical: boolean;
};

export function parseMsCost(cost: string): number {
  const digitsOnly = cost.replace(/\D/g, "");
  if (digitsOnly.length > 0) {
    const n = parseInt(digitsOnly, 10);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), 999_999) : 0;
  }
  const n = Number(String(cost).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 999_999) : 0;
}

function costFactor(costStr: string): number {
  const n = parseMsCost(costStr);
  if (n <= 0) return 0;
  return Math.min(1, n / COST_REFERENCE);
}

export function critChanceForAttacker(attackerCost: string): number {
  return Math.min(
    MAX_CRIT_CHANCE,
    BASE_CRIT_CHANCE + costFactor(attackerCost) * CRIT_BONUS_AT_FULL_COST,
  );
}

export function evadeChanceForDefender(defenderCost: string): number {
  return Math.min(
    MAX_EVADE_CHANCE,
    BASE_EVADE_CHANCE + costFactor(defenderCost) * EVADE_BONUS_AT_FULL_COST,
  );
}

export function resolveAttackOutcome(
  baseDamage: number,
  attackerCost: string,
  defenderCost: string,
): AttackOutcome {
  if (baseDamage <= 0) {
    return { finalDamage: 0, evaded: false, critical: false };
  }

  if (Math.random() < evadeChanceForDefender(defenderCost)) {
    return { finalDamage: 0, evaded: true, critical: false };
  }

  let finalDamage = baseDamage;
  let critical = false;
  if (Math.random() < critChanceForAttacker(attackerCost)) {
    critical = true;
    finalDamage = Math.max(1, Math.floor(baseDamage * CRIT_DAMAGE_MULTIPLIER));
  }

  return { finalDamage, evaded: false, critical };
}

export function buildAttackLogLine(
  attackerName: string,
  attackLabel: string,
  defenderName: string,
  outcome: AttackOutcome,
): BattleLogPart[] {
  if (outcome.evaded) {
    return [
      { text: attackerName, bold: true },
      { text: " uses " },
      { text: attackLabel },
      { text: " on " },
      { text: defenderName, bold: true },
      { text: " — " },
      { text: "Evaded!", bold: true },
    ];
  }

  const parts: BattleLogPart[] = [
    { text: attackerName, bold: true },
    { text: " uses " },
    { text: attackLabel },
    { text: " on " },
    { text: defenderName, bold: true },
  ];
  if (outcome.critical) {
    parts.push({ text: " — " });
    parts.push({ text: "Critical! ", bold: true });
  }
  parts.push({ text: ` for ${outcome.finalDamage} damage.` });
  return parts;
}
