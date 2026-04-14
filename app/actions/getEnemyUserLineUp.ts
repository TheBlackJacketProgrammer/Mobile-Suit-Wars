"use server";


import { mobile_suits } from "../generated/prisma/client";
import { getUserIdByUsername } from "./getUserIdByUsername";
import { getMSLineUp } from "@/lib/getMSLineUp";

/** Latest lineup stats from DB (after rewards, armor, etc.). */
export async function getEnemyUserLineUp(enemyId: string) {

    // Step 1: Get u_id of the enemyId
    const u_id = await getUserIdByUsername(enemyId);

    // Step 2: Get MS lineup of that u_id
    const lineup = await getMSLineUp(u_id);

    // Step 3: Format and return the lineup details
    const enemyLineup: mobile_suits[] = lineup.map((item) => {
        return {
            ms_id: item.msId,
            ms_name: item.name,
            ms_mid: item.mid,
            ms_cost: item.cost,
            ms_level: item.level,
            ms_exp: item.exp,
            ms_armor: item.armor,
            ms_basicAtkdmg: item.basicAtkdmg,
            ms_atk1: item.skill1,
            ms_atk2: item.skill2,
            ms_atk3: item.skill3,
            ms_atk1dmg: item.skill1dmg,
            ms_atk2dmg: item.skill2dmg,
            ms_atk3dmg: item.skill3dmg,
            ms_atk1Eff: null,
            ms_atk2Eff: null,
            ms_atk3Eff: null,
            ms_pic: item.pic,
        };
    });

    return enemyLineup;
}
