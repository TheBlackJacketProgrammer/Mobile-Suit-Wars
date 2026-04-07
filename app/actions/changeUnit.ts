"use server";

import prisma from "@/lib/prisma";
import { getUserId } from "./getUserId";

export async function changeUnit(currentMS_mid: string, newMS_mid: string) {
    // Step 1: Get the mobile suit id of the current mobile suit
    const currentMS = await prisma.mobile_suits.findFirst({
        where: {
            ms_mid: currentMS_mid,
        },
    });
    if (!currentMS) {
        return { error: "Current mobile suit not found" };
    }

    // Step 2: Get the mobile suit id of the new mobile suit
    const newMS = await prisma.mobile_suits.findFirst({
        where: {
            ms_mid: newMS_mid,
        },
    });
    if (!newMS) {
        return { error: "New mobile suit not found" };
    }

    // Step 3: Get the user id
    const u_id = Number(await getUserId());

    // Step 4: Update the Current Mobile Suit to be not on lineup
    await prisma.user_has_mobile_suits.update({
        where: {
            u_id_ms_id: {
                u_id: u_id,
                ms_id: currentMS.ms_id,
            },
        },
        data: {
            ums_onLineup: "No",
        },
    });

    // Step 5: Update the New Mobile Suit to be on lineup
    await prisma.user_has_mobile_suits.update({
        where: {
            u_id_ms_id: {
                u_id: u_id,
                ms_id: newMS.ms_id,
            },
        },
        data: {
            ums_onLineup: "Yes",
        },
    });

    return { success: "Unit changed successfully" };
}