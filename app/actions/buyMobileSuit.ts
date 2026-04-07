"use server";

import prisma from "@/lib/prisma";
import { getUserId } from "./getUserId";
import { getUserGPoints } from "./getUserGPoints";
import { getMobileSuitDetails } from "./getMobileSuitDetails";

export async function buyMobileSuit( ms_id: number) {
    const u_id = Number(await getUserId());
    const ms = await getMobileSuitDetails(ms_id);
    if ("error" in ms) {
        return { error: ms.error };
    }
    const ms_cost = Number(ms.ms_cost);

    // Step 0: Check if the mobile suit is already bought
    const userMobileSuit = await prisma.user_has_mobile_suits.findFirst({
        where: { u_id: u_id, ms_id: ms_id },
    });
    if (userMobileSuit) {
        return { error: "Mobile suit already in your inventory" };
    }

    // Step 1: Check if the user has enough points to buy the mobile suit
    const userPoints = await getUserGPoints(u_id);
    if (userPoints < ms_cost) {
        return { error: "Not enough points to buy the mobile suit" };
    }

    // Step 2: Deduct the points from the user
    await prisma.user.update({
        where: { u_id: u_id },
        data: { u_points: userPoints - ms_cost },
    });

    // Step 3: Add the mobile suit to the user
    await prisma.user_has_mobile_suits.create({
        data: {
            u_id: u_id,
            ms_id: ms_id,
            ums_armor: 0,
            ums_level: 1,
            ums_exp: 0,
            ums_atk1dmg: 0,
            ums_atk2dmg: 0,
            ums_atk3dmg: 0,
            ums_onLineup: "No",
        },
    });

    return { success: "Mobile suit bought successfully" };
}
 