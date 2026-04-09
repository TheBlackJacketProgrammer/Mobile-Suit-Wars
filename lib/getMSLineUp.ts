import prisma from "@/lib/prisma";
import { coerceTotalExpFromRow, levelAndProgressFromTotal } from "./battleWinRewards";

export type MSLineUpUnit = {
  msId: number;
  name: string;
  mid: string;
  cost: number;
  level: number;
  /** Progress EXP toward the next level (bar). See totalExp for lifetime cumulative. */
  exp: number;
  /** Lifetime cumulative EXP (only increases when you earn EXP). */
  totalExp: number;
  /** Raw `user_has_mobile_suits.ums_exp` column. */
  umsExp: number;
  armor: number;
  basicAtkdmg: number;
  skill1: string;
  skill2: string;
  skill3: string;
  skill1dmg: number;
  skill2dmg: number;
  skill3dmg: number;
  pic: string;
};

export async function getMSLineUp(userId: number): Promise<MSLineUpUnit[]> {
  const result = await prisma.user_has_mobile_suits.findMany({
    where: {
      u_id: Number(userId),
      ums_onLineup: "Yes",
    },
    include: {
      mobile_suits: true,
    },
    orderBy: { ms_id: "asc" },
  });

  // Format the result into a more readable format
  const lineup: MSLineUpUnit[] = result.map((item) => {
    const total = coerceTotalExpFromRow(item.ums_level ?? 1, item.ums_exp ?? 0);
    const { level, progress } = levelAndProgressFromTotal(total);
    return {
    msId: item.ms_id,
    name: item.mobile_suits.ms_name ?? "",
    mid: item.mobile_suits.ms_mid ?? "",
    cost: item.mobile_suits.ms_cost ?? 0,
    level,
    exp: progress,
    totalExp: total,
    umsExp: item.ums_exp ?? 0,
    armor: (item.mobile_suits.ms_armor ?? 0) + (item.ums_armor ?? 0),
    basicAtkdmg:
      (item.mobile_suits.ms_basicAtkdmg ?? 0) + (item.ums_basicAtkdmg ?? 0),
    skill1: item.mobile_suits.ms_atk1 ?? "",
    skill2: item.mobile_suits.ms_atk2 ?? "",
    skill3: item.mobile_suits.ms_atk3 ?? "",
    skill1dmg: (item.mobile_suits.ms_atk1dmg ?? 0) + (item.ums_atk1dmg ?? 0),
    skill2dmg: (item.mobile_suits.ms_atk2dmg ?? 0) + (item.ums_atk2dmg ?? 0),
    skill3dmg: (item.mobile_suits.ms_atk3dmg ?? 0) + (item.ums_atk3dmg ?? 0),
    pic: item.mobile_suits.ms_pic ?? "",
  };
  });

  return lineup;
}