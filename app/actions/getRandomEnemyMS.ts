import prisma from "@/lib/prisma";

export async function getRandomEnemyMS() {
    const count = await prisma.mobile_suits.count();

    const take = 3;
    const skip = Math.max(0, Math.floor(Math.random() * (count - take)));

    const randomItems = await prisma.mobile_suits.findMany({
        skip,
        take,
    });

    return randomItems;
}