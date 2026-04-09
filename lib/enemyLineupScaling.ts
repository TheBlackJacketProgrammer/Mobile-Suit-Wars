import {
  ARMOR_BONUS_PER_LEVEL_UP,
  DAMAGE_BONUS_PER_LEVEL_UP,
  MAX_UNIT_LEVEL,
} from "./battleWinRewards";

/**
 * Larger ref → gentler multiplier. Tuned so ~avg 20 gives ~+24% basic / ~+35% skill;
 * scales from `DAMAGE_BONUS_PER_LEVEL_UP` × (avgLevel − 1) as a flat “power budget”
 * spread across typical hit sizes.
 */
const ENEMY_BASIC_SCALE_REF_DAMAGE = 8000;
const ENEMY_SKILL_SCALE_REF_DAMAGE = 5500;

/** Same idea as damage, using `ARMOR_BONUS_PER_LEVEL_UP` vs typical enemy armor. */
const ENEMY_ARMOR_SCALE_REF = 15000;

/**
 * Convert lineup-based “power budget” into extra evade/crit probability (capped).
 * Separate refs so skills tank harder than crits grow.
 */
const ENEMY_EVADE_CHANCE_BONUS_REF = 40000;
const ENEMY_CRIT_CHANCE_BONUS_REF = 45000;
const MAX_EXTRA_EVADE_CHANCE_FROM_LINEUP = 0.12;
const MAX_EXTRA_CRIT_CHANCE_FROM_LINEUP = 0.12;

/** Clamps to [1, MAX_UNIT_LEVEL]; fractional averages are kept (e.g. 4+5+6 → 5). */
function clampAvgLevel(avg: number): number {
  if (!Number.isFinite(avg)) return 1;
  return Math.min(MAX_UNIT_LEVEL, Math.max(1, avg));
}

/**
 * Mean level across the lineup (fractional). Empty lineup → 1 so enemies stay at base strength.
 */
export function averageMsLineupLevel(lineup: { level: number }[]): number {
  if (lineup.length === 0) return 1;
  let sum = 0;
  for (const u of lineup) {
    const L = Math.min(MAX_UNIT_LEVEL, Math.max(1, Math.floor(Number(u.level))));
    sum += L;
  }
  return sum / lineup.length;
}

function multiplierFromAvgLevel(
  avgLevel: number,
  refDamage: number,
): number {
  const avgL = clampAvgLevel(avgLevel);
  if (avgL <= 1) return 1;
  const delta = avgL - 1;
  const bonusEquivalent = DAMAGE_BONUS_PER_LEVEL_UP * delta;
  return 1 + bonusEquivalent / refDamage;
}

export function scaleEnemyBasicDamageForLineup(
  base: number,
  avgLineupLevel: number,
): number {
  const m = multiplierFromAvgLevel(avgLineupLevel, ENEMY_BASIC_SCALE_REF_DAMAGE);
  return Math.max(0, Math.round(base * m));
}

export function scaleEnemySkillDamageForLineup(
  base: number,
  avgLineupLevel: number,
): number {
  const m = multiplierFromAvgLevel(avgLineupLevel, ENEMY_SKILL_SCALE_REF_DAMAGE);
  return Math.max(0, Math.round(base * m));
}

function armorMultiplierFromAvgLevel(avgLevel: number): number {
  const avgL = clampAvgLevel(avgLevel);
  if (avgL <= 1) return 1;
  const delta = avgL - 1;
  const bonusEquivalent = ARMOR_BONUS_PER_LEVEL_UP * delta;
  return 1 + bonusEquivalent / ENEMY_ARMOR_SCALE_REF;
}

export function scaleEnemyArmorForLineup(
  base: number,
  avgLineupLevel: number,
): number {
  const m = armorMultiplierFromAvgLevel(avgLineupLevel);
  return Math.max(1, Math.round(base * m));
}

/** Extra evade chance when the defender is an enemy scaled to player lineup (player attacking). */
export function enemyDefenderEvadeBonusFromAvgLineup(
  avgLineupLevel: number,
): number {
  const avgL = clampAvgLevel(avgLineupLevel);
  if (avgL <= 1) return 0;
  const delta = avgL - 1;
  const raw =
    (DAMAGE_BONUS_PER_LEVEL_UP * delta) / ENEMY_EVADE_CHANCE_BONUS_REF;
  return Math.min(MAX_EXTRA_EVADE_CHANCE_FROM_LINEUP, raw);
}

/** Extra crit chance when the attacker is an enemy scaled to player lineup (enemy attacking). */
export function enemyAttackerCritBonusFromAvgLineup(
  avgLineupLevel: number,
): number {
  const avgL = clampAvgLevel(avgLineupLevel);
  if (avgL <= 1) return 0;
  const delta = avgL - 1;
  const raw =
    (DAMAGE_BONUS_PER_LEVEL_UP * delta) / ENEMY_CRIT_CHANCE_BONUS_REF;
  return Math.min(MAX_EXTRA_CRIT_CHANCE_FROM_LINEUP, raw);
}
