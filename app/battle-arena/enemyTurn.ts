import type { mobile_suits } from "../generated/prisma/client";
import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import {
  enemyAttackerCritBonusFromAvgLineup,
  scaleEnemyBasicDamageForLineup,
  scaleEnemySkillDamageForLineup,
} from "@/lib/enemyLineupScaling";
import type { BattleLogPart } from "./battleLog";
import { buildAttackLogLine, resolveAttackOutcome } from "./battleCritEvade";
import {
  canUseAction,
  consumeCharge,
  createInitialAttackCharges,
  type UnitAttackCharges,
} from "./battleAttackCharges";
import type { MSActionHover } from "./types";

type EnemyAttackOption = {
  label: string;
  damage: number;
  action: MSActionHover;
};

const ENEMY_BASIC_WEIGHT = 1;
const ENEMY_SKILL_WEIGHT = 10;

function buildEnemyAttackOptions(
  enemy: mobile_suits,
  avgLineupLevel: number,
): EnemyAttackOption[] {
  const opts: EnemyAttackOption[] = [
    {
      label: "Basic Attack",
      damage: scaleEnemyBasicDamageForLineup(
        enemy.ms_basicAtkdmg,
        avgLineupLevel,
      ),
      action: "basic",
    },
    {
      label: enemy.ms_atk1,
      damage: scaleEnemySkillDamageForLineup(enemy.ms_atk1dmg, avgLineupLevel),
      action: "skill1",
    },
    {
      label: enemy.ms_atk2,
      damage: scaleEnemySkillDamageForLineup(enemy.ms_atk2dmg, avgLineupLevel),
      action: "skill2",
    },
    {
      label: enemy.ms_atk3,
      damage: scaleEnemySkillDamageForLineup(enemy.ms_atk3dmg, avgLineupLevel),
      action: "skill3",
    },
  ];
  return opts;
}

function pickRandomEnemyAttack(
  enemy: mobile_suits,
  charges: UnitAttackCharges,
  avgLineupLevel: number,
): EnemyAttackOption | null {
  const all = buildEnemyAttackOptions(enemy, avgLineupLevel);
  const usable = all.filter(
    (o) => o.damage > 0 && canUseAction(charges, o.action),
  );

  type Weighted = { opt: EnemyAttackOption; w: number };
  const weighted: Weighted[] = [];
  for (const o of usable) {
    const w = o.action === "basic" ? ENEMY_BASIC_WEIGHT : ENEMY_SKILL_WEIGHT;
    weighted.push({ opt: o, w });
  }

  if (weighted.length === 0) {
    const fallback = all.filter((o) => canUseAction(charges, o.action));
    if (fallback.length === 0) return null;
    return fallback[Math.floor(Math.random() * fallback.length)]!;
  }

  const total = weighted.reduce((sum, x) => sum + x.w, 0);
  let roll = Math.random() * total;
  for (const { opt, w } of weighted) {
    roll -= w;
    if (roll < 0) return opt;
  }
  return weighted[weighted.length - 1]!.opt;
}

function enemyHasUsableAttack(
  enemy: mobile_suits,
  ch: UnitAttackCharges,
  avgLineupLevel: number,
): boolean {
  return buildEnemyAttackOptions(enemy, avgLineupLevel).some((o) =>
    canUseAction(ch, o.action),
  );
}

export function runEnemyCounterAttack(
  lineup: MSLineUpUnit[],
  enemyMS: mobile_suits[],
  enemyHP: number[],
  playerHP: number[],
  enemyCharges: UnitAttackCharges[],
  avgLineupLevel: number,
): {
  newPlayerHP: number[];
  nextEnemyCharges: UnitAttackCharges[];
  logEntry: BattleLogPart[];
  targetPlayerIndex: number;
  evaded: boolean;
  attackerEnemyIndex: number;
} | null {
  const aliveEnemyIdx = enemyHP
    .map((hp, i) => (hp > 0 ? i : -1))
    .filter((i) => i >= 0);
  const alivePlayerIdx = playerHP
    .map((hp, i) => (hp > 0 ? i : -1))
    .filter((i) => i >= 0);
  if (aliveEnemyIdx.length === 0 || alivePlayerIdx.length === 0) return null;

  const pickFrom = aliveEnemyIdx.filter((i) => {
    const ch = enemyCharges[i] ?? createInitialAttackCharges();
    return enemyHasUsableAttack(enemyMS[i]!, ch, avgLineupLevel);
  });
  if (pickFrom.length === 0) return null;

  const eIdx = pickFrom[Math.floor(Math.random() * pickFrom.length)]!;
  const pIdx =
    alivePlayerIdx[Math.floor(Math.random() * alivePlayerIdx.length)]!;
  const enemy = enemyMS[eIdx]!;
  const defender = lineup[pIdx]!;
  const slotCharges = enemyCharges[eIdx] ?? createInitialAttackCharges();

  const attack = pickRandomEnemyAttack(enemy, slotCharges, avgLineupLevel);
  if (!attack) return null;
  const consumed = consumeCharge(slotCharges, attack.action);
  if (!consumed) return null;
  const nextSlotCharges = consumed;

  const nextEnemyCharges = enemyCharges.map((c, i) =>
    i === eIdx ? nextSlotCharges : c,
  );

  const outcome = resolveAttackOutcome(
    attack.damage,
    enemy.ms_cost,
    defender.cost,
    {
      attackerCritBonus: enemyAttackerCritBonusFromAvgLineup(avgLineupLevel),
    },
  );

  const newPlayerHP = [...playerHP];
  if (!outcome.evaded) {
    newPlayerHP[pIdx] = Math.max(0, newPlayerHP[pIdx] - outcome.finalDamage);
  }

  const logEntry = buildAttackLogLine(
    enemy.ms_name,
    attack.label,
    defender.name,
    outcome,
  );

  return {
    newPlayerHP,
    nextEnemyCharges,
    logEntry,
    targetPlayerIndex: pIdx,
    evaded: outcome.evaded,
    attackerEnemyIndex: eIdx,
  };
}
