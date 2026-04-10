"use server";

import prisma from "@/lib/prisma";
import { getUserId } from "./getUserId";

export async function setNewPlayerLineup(newMS_mid_list: string[]) {
  const u_id = Number(await getUserId());

  // Step 1: get MS records
  const msList = await prisma.mobile_suits.findMany({
    where: {
      ms_mid: {
        in: newMS_mid_list,
      },
    },
  });

  if (msList.length === 0) {
    return { error: "No mobile suits found" };
  }

  // Step 2: prepare insert data
  const insertData = msList.map((ms) => ({
    u_id,
    ms_id: ms.ms_id,
    ums_onLineup: "Yes",
    ums_armor: 0,
    ums_level: 1,
    ums_exp: 0,
    ums_basicAtkdmg: 0,
    ums_atk1dmg: 0,
    ums_atk2dmg: 0,
    ums_atk3dmg: 0,
  }));

  // Step 3: insert multiple rows
  await prisma.user_has_mobile_suits.createMany({
    data: insertData,
    skipDuplicates: true, // prevents crashing if already exists
  });

  // Step 4: Update user status
  await prisma.user.update({
    where: {
      u_id: u_id
    },
    data: {
      u_status: "Old",
    },
});

  return { success: "3 units inserted into lineup" };
}