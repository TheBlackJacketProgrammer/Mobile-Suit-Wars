/**
 * EXP required to go from `level` → `level + 1` (current level 1..98).
 * Level tree: L1–9 → 100; L10–19 → 300; L20–29 → 400; L30–49 → 500; L50–98 → 1000.
 */
export function expRequiredToAdvance(level: number): number {
  if (level < 1) return 100;
  if (level >= 99) return Number.POSITIVE_INFINITY;
  if (level <= 9) return 100;
  if (level <= 19) return 300;
  if (level <= 29) return 400;
  if (level <= 49) return 500;
  return 1000;
}

export const MAX_UNIT_LEVEL = 99;

/**
 * Legacy rows: `storedProgress` was only EXP toward the next level.
 * Returns equivalent lifetime total EXP.
 */
export function progressToTotalExp(
  storedLevel: number,
  storedProgress: number,
): number {
  const L = Math.min(MAX_UNIT_LEVEL, Math.max(1, storedLevel));
  let total = Math.max(0, storedProgress);
  for (let l = 1; l < L; l++) {
    total += expRequiredToAdvance(l);
  }
  return total;
}

/**
 * From lifetime total EXP: current level and EXP still needed toward the *next* level.
 */
export function levelAndProgressFromTotal(totalExp: number): {
  level: number;
  progress: number;
} {
  let L = 1;
  let rem = Math.max(0, totalExp);
  while (L < MAX_UNIT_LEVEL) {
    const need = expRequiredToAdvance(L);
    if (rem < need) return { level: L, progress: rem };
    rem -= need;
    L += 1;
  }
  return { level: MAX_UNIT_LEVEL, progress: rem };
}

/**
 * `ums_exp` is either lifetime cumulative EXP, or legacy “progress toward next” only.
 * If treating the value as cumulative yields the same level as `storedLevel`, use it as total.
 */
export function coerceTotalExpFromRow(
  storedLevel: number,
  storedValue: number,
): number {
  const L = Math.min(MAX_UNIT_LEVEL, Math.max(1, storedLevel));
  const v = Math.max(0, storedValue);
  const ifCumulative = levelAndProgressFromTotal(v);
  if (ifCumulative.level === L) return v;
  return progressToTotalExp(L, v);
}

/** Add battle EXP to lifetime total; level and bar progress are derived (total never decreases). */
export function addBattleExpCumulative(
  storedLevel: number,
  storedValue: number,
  gainedExp: number,
): {
  totalBefore: number;
  totalAfter: number;
  levelBefore: number;
  progressBefore: number;
  newLevel: number;
  progressAfter: number;
  levelsGained: number;
} {
  const totalBefore = coerceTotalExpFromRow(storedLevel, storedValue);
  const { level: levelBefore, progress: progressBefore } =
    levelAndProgressFromTotal(totalBefore);
  const totalAfter = totalBefore + gainedExp;
  const { level: newLevel, progress: progressAfter } =
    levelAndProgressFromTotal(totalAfter);
  return {
    totalBefore,
    totalAfter,
    levelBefore,
    progressBefore,
    newLevel,
    progressAfter,
    levelsGained: newLevel - levelBefore,
  };
}

/** Per surviving unit EXP and one-time user G-points from battle length. */
export function battleRewardsForTurn(turn: number): {
  unitExp: number;
  userGPoints: number;
} {
  const t = Math.max(1, Math.floor(turn));
  if (t <= 3) return { unitExp: 1000, userGPoints: 1000 };
  if (t >= 6 && t <= 7) return { unitExp: 500, userGPoints: 500 };
  if (t > 7) return { unitExp: 100, userGPoints: 100 };
  return { unitExp: 500, userGPoints: 500 };
}

export const DAMAGE_BONUS_PER_LEVEL_UP = 100;
export const ARMOR_BONUS_PER_LEVEL_UP = 250;
