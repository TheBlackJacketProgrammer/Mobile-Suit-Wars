"use server";

import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import {
  addBattleExpCumulative,
  ARMOR_BONUS_PER_LEVEL_UP,
  battleRewardsForTurn,
  coerceTotalExpFromRow,
  DAMAGE_BONUS_PER_LEVEL_UP,
  levelAndProgressFromTotal,
} from "@/lib/battleWinRewards";

export type WinLineupUnitSummary = {
  slotIndex: number;
  msId: number;
  name: string;
  modelId: string;
  levelBefore: number;
  levelGained: number;
  levelAfter: number;
  /** Progress toward next level before / after (bar). */
  expBefore: number;
  expAfter: number;
  /** Lifetime cumulative EXP — only ever increases when rewarded. */
  totalExpBefore: number;
  totalExpAfter: number;
  expRewarded: number;
  rewarded: boolean;
};

export type ApplyBattleWinSuccess = {
  ok: true;
  gPointsBefore: number;
  gPointsRewarded: number;
  gPointsAfter: number;
  units: WinLineupUnitSummary[];
};

export type ApplyBattleWinRewardsResult =
  | ApplyBattleWinSuccess
  | { ok: false; error: string };

export async function applyBattleWinRewards(input: {
  finalTurnCount: number;
  survivingMsIds: number[];
}): Promise<ApplyBattleWinRewardsResult> {
  const session = await getServerSession(authOptions);
  const rawId = session?.user?.id;
  if (rawId == null || !Number.isFinite(Number(rawId))) {
    return { ok: false, error: "Not signed in." };
  }
  const userId = Number(rawId);

  const { unitExp, userGPoints } = battleRewardsForTurn(input.finalTurnCount);

  const lineupRows = await prisma.user_has_mobile_suits.findMany({
    where: { u_id: userId, ums_onLineup: "Yes" },
    include: { mobile_suits: true },
    orderBy: { ms_id: "asc" },
  });

  if (lineupRows.length === 0) {
    return { ok: false, error: "No units on your lineup." };
  }

  const lineupMsIds = new Set(lineupRows.map((r) => r.ms_id));
  const surviveSet = new Set(
    input.survivingMsIds.filter(
      (id) => Number.isInteger(id) && id > 0 && lineupMsIds.has(id),
    ),
  );

  const userRow = await prisma.user.findUnique({
    where: { u_id: userId },
    select: { u_points: true },
  });
  const gPointsBefore = userRow?.u_points ?? 0;

  const units: WinLineupUnitSummary[] = [];

  await prisma.$transaction(async (tx) => {
    if (userGPoints > 0) {
      await tx.user.update({
        where: { u_id: userId },
        data: { u_points: { increment: userGPoints } },
      });
    }

    let slotIndex = 0;
    for (const row of lineupRows) {
      const survived = surviveSet.has(row.ms_id);
      const lb = row.ums_level ?? 1;
      const eb = row.ums_exp ?? 0;

      if (!survived) {
        const total = coerceTotalExpFromRow(lb, eb);
        const { level, progress } = levelAndProgressFromTotal(total);
        units.push({
          slotIndex,
          msId: row.ms_id,
          name: row.mobile_suits.ms_name ?? "",
          modelId: row.mobile_suits.ms_mid ?? "",
          levelBefore: level,
          levelGained: 0,
          levelAfter: level,
          expBefore: progress,
          expRewarded: 0,
          expAfter: progress,
          totalExpBefore: total,
          totalExpAfter: total,
          rewarded: false,
        });
        slotIndex += 1;
        continue;
      }

      const r = addBattleExpCumulative(lb, eb, unitExp);
      const dmgBonus = r.levelsGained * DAMAGE_BONUS_PER_LEVEL_UP;
      const armorBonus = r.levelsGained * ARMOR_BONUS_PER_LEVEL_UP;

      await tx.user_has_mobile_suits.update({
        where: { u_id_ms_id: { u_id: userId, ms_id: row.ms_id } },
        data: {
          ums_level: r.newLevel,
          ums_exp: r.totalAfter,
          ums_armor: (row.ums_armor ?? 0) + armorBonus,
          ums_basicAtkdmg: (row.ums_basicAtkdmg ?? 0) + dmgBonus,
          ums_atk1dmg: (row.ums_atk1dmg ?? 0) + dmgBonus,
          ums_atk2dmg: (row.ums_atk2dmg ?? 0) + dmgBonus,
          ums_atk3dmg: (row.ums_atk3dmg ?? 0) + dmgBonus,
        },
      });

      units.push({
        slotIndex,
        msId: row.ms_id,
        name: row.mobile_suits.ms_name ?? "",
        modelId: row.mobile_suits.ms_mid ?? "",
        levelBefore: r.levelBefore,
        levelGained: r.levelsGained,
        levelAfter: r.newLevel,
        expBefore: r.progressBefore,
        expRewarded: unitExp,
        expAfter: r.progressAfter,
        totalExpBefore: r.totalBefore,
        totalExpAfter: r.totalAfter,
        rewarded: true,
      });
      slotIndex += 1;
    }
  });

  const userAfter = await prisma.user.findUnique({
    where: { u_id: userId },
    select: { u_points: true },
  });
  const gPointsAfter = userAfter?.u_points ?? gPointsBefore + userGPoints;

  return {
    ok: true,
    gPointsBefore,
    gPointsRewarded: userGPoints,
    gPointsAfter,
    units,
  };
}
