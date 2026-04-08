import type { mobile_suits } from "../generated/prisma/client";
import type { MSLineUpUnit } from "@/lib/getMSLineUp";

/** One living enemy basic-attacks one random living player unit. */
export function runEnemyCounterAttack(
  lineup: MSLineUpUnit[],
  enemyMS: mobile_suits[],
  enemyHP: number[],
  playerHP: number[],
): {
  newPlayerHP: number[];
  logLine: string;
  targetPlayerIndex: number;
} | null {
  const aliveEnemyIdx = enemyHP
    .map((hp, i) => (hp > 0 ? i : -1))
    .filter((i) => i >= 0);
  const alivePlayerIdx = playerHP
    .map((hp, i) => (hp > 0 ? i : -1))
    .filter((i) => i >= 0);
  if (aliveEnemyIdx.length === 0 || alivePlayerIdx.length === 0) return null;

  const eIdx =
    aliveEnemyIdx[Math.floor(Math.random() * aliveEnemyIdx.length)]!;
  const pIdx =
    alivePlayerIdx[Math.floor(Math.random() * alivePlayerIdx.length)]!;
  const dmg = enemyMS[eIdx].ms_basicAtkdmg;
  const newPlayerHP = [...playerHP];
  newPlayerHP[pIdx] = Math.max(0, newPlayerHP[pIdx] - dmg);
  const logLine = `${enemyMS[eIdx].ms_name} strikes ${lineup[pIdx].name} for ${dmg} damage.`;
  return { newPlayerHP, logLine, targetPlayerIndex: pIdx };
}
