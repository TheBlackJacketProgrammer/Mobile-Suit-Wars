"use server";

import prisma from "@/lib/prisma";

export async function searchUsername(username: string) {
    const user = await prisma.user.findUnique({
        where: {
            u_account: username,
        },
    });
    return user?.u_account ?? null;
}