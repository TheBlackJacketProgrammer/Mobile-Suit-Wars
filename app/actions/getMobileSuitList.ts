import prisma from "@/lib/prisma";

export async function getMobileSuitList() {
    const result = await prisma.mobile_suits.findMany();
    const mobileSuits = result.map((ms) => ({
        ms_mid: ms.ms_mid,
        ms_name: ms.ms_name,
        ms_pic: ms.ms_pic,
        ms_cost: ms.ms_cost,
        ms_armor: ms.ms_armor,
        ms_level: ms.ms_level,
        ms_exp: ms.ms_exp,
        ms_atk1: ms.ms_atk1,
        ms_atk2: ms.ms_atk2,
        ms_atk3: ms.ms_atk3,
        ms_atk1dmg: ms.ms_atk1dmg,
        ms_atk2dmg: ms.ms_atk2dmg,
        ms_atk3dmg: ms.ms_atk3dmg
    }));
    return mobileSuits;
}