import prisma from "@/lib/prisma";

export async function getUserGPoints(userId: number) {
    const user = await prisma.user.findUnique({
        where: {
            u_id: userId,
        },
    });
    return user?.u_points ?? 0;
}