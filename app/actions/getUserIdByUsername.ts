"use server";
import prisma from "@/lib/prisma";

export async function getUserIdByUsername(enemyId: string) {
    const user = await prisma.user.findUnique({
        where: {
            u_account: enemyId,
        },
    });
    return user?.u_id ?? 0;
}