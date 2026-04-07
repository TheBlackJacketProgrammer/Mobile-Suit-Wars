import prisma from "@/lib/prisma";

export async function getMobileSuitDetails(ms_id: number) {
    const result = await prisma.mobile_suits.findUnique({
        where: { ms_id: ms_id },
    });
    if (!result) {
        return { error: "Mobile suit not found" };
    }
    return result;
}