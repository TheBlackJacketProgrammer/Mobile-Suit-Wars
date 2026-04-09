"use server";

import prisma from "@/lib/prisma";
import {
  coerceTotalExpFromRow,
  levelAndProgressFromTotal,
} from "@/lib/battleWinRewards";
import { getUserId } from "./getUserId";

export async function getUserMobileSuits() {
    const u_id = await getUserId();
    const userMobileSuits = await prisma.user_has_mobile_suits.findMany({
        where: { u_id: Number(u_id), ums_onLineup: "No" },
        include: {
            mobile_suits: true,
        },
    });
    const mobileSuits = userMobileSuits.map((userMobileSuit) => {
        const total = coerceTotalExpFromRow(
            userMobileSuit.ums_level ?? 1,
            userMobileSuit.ums_exp ?? 0,
        );
        const { level, progress } = levelAndProgressFromTotal(total);
        return {
        mid: userMobileSuit.mobile_suits.ms_mid ?? "",
        name: userMobileSuit.mobile_suits.ms_name ?? "",
        pic: userMobileSuit.mobile_suits.ms_pic ?? "",
        armor: userMobileSuit.ums_armor ?? 0,
        level,
        exp: progress,
        totalExp: total,
        basicAtkdmg: userMobileSuit.ums_basicAtkdmg ?? 0,
        atk1: userMobileSuit.mobile_suits.ms_atk1 ?? "",
        atk2: userMobileSuit.mobile_suits.ms_atk2 ?? "",
        atk3: userMobileSuit.mobile_suits.ms_atk3 ?? "",
        atk1dmg: (userMobileSuit.mobile_suits.ms_atk1dmg ?? 0) + (userMobileSuit.ums_atk1dmg ?? 0),
        atk2dmg: (userMobileSuit.mobile_suits.ms_atk2dmg ?? 0) + (userMobileSuit.ums_atk2dmg ?? 0),
        atk3dmg: (userMobileSuit.mobile_suits.ms_atk3dmg ?? 0) + (userMobileSuit.ums_atk3dmg ?? 0),
        isOnLineup: userMobileSuit.ums_onLineup ?? "No",
    };
    });
    return mobileSuits;
}