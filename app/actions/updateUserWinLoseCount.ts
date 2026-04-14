"use server";

import prisma from "@/lib/prisma";
import { getUserId } from "./getUserId";

export async function updateUserWinLoseCount({win}: {win: boolean}) {
    const u_id = Number(await getUserId());
    return await prisma.user_leaderboard.upsert({
        where: {
            u_id: u_id, // must be UNIQUE
        },
        update: {
            ...(win
            ? {
                win_count: { increment: 1 },
            }
            : {
                lose_count: { increment: 1 },
            }),
        },
        create: {
            u_id: u_id,
            win_count: win ? 1 : 0,
            lose_count: !win ? 1 : 0,
        },
    });
}