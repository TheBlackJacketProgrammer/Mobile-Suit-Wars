"use server";

import prisma from "@/lib/prisma";
import { getUserId } from "./getUserId";

export async function getUserMobileSuits() {
    const u_id = await getUserId();
    const userMobileSuits = await prisma.user_has_mobile_suits.findMany({
        where: { u_id: Number(u_id), ums_onLineup: "No" },
        include: {
            mobile_suits: true,
        },
    });
    const mobileSuits = userMobileSuits.map((userMobileSuit) => ({
        mid: userMobileSuit.mobile_suits.ms_mid,
        name: userMobileSuit.mobile_suits.ms_name,
        pic: userMobileSuit.mobile_suits.ms_pic,
        armor: userMobileSuit.ums_armor,
        level: userMobileSuit.ums_level,
        exp: userMobileSuit.ums_exp,
        basicAtkdmg: userMobileSuit.ums_basicAtkdmg,
        atk1: userMobileSuit.mobile_suits.ms_atk1,
        atk2: userMobileSuit.mobile_suits.ms_atk2,
        atk3: userMobileSuit.mobile_suits.ms_atk3,
        atk1dmg: userMobileSuit.mobile_suits.ms_atk1dmg + userMobileSuit.ums_atk1dmg,
        atk2dmg: userMobileSuit.mobile_suits.ms_atk2dmg + userMobileSuit.ums_atk2dmg,
        atk3dmg: userMobileSuit.mobile_suits.ms_atk3dmg + userMobileSuit.ums_atk3dmg,
        isOnLineup: userMobileSuit.ums_onLineup,
    }));
    return mobileSuits;
}