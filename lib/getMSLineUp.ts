import prisma from "@/lib/prisma";

export type MSLineUpUnit = {
  name: string;
  mid: string;
  level: number;
  exp: number;
  armor: number;
  basicAtkdmg: number;
  skill1: string;
  skill2: string;
  skill3: string;
  skill1dmg: number;
  skill2dmg: number;
  skill3dmg: number;
  pic: string;
};

export async function getMSLineUp(userId: number): Promise<MSLineUpUnit[]> {
  const result = await prisma.user_has_mobile_suits.findMany({
    where: {
      u_id: Number(userId),
      ums_onLineup: "Yes",
    },
    include: {
      mobile_suits: true,
    },
  });

  // Format the result into a more readable format
  const lineup: MSLineUpUnit[] = result.map((item) => ({
    name: item.mobile_suits.ms_name,
    mid: item.mobile_suits.ms_mid,
    level: item.ums_level,
    exp: item.ums_exp,
    armor: item.mobile_suits.ms_armor + item.ums_armor,
    basicAtkdmg: item.mobile_suits.ms_basicAtkdmg + item.ums_basicAtkdmg,
    skill1: item.mobile_suits.ms_atk1,
    skill2: item.mobile_suits.ms_atk2,
    skill3: item.mobile_suits.ms_atk3,
    skill1dmg: item.mobile_suits.ms_atk1dmg + item.ums_atk1dmg,
    skill2dmg: item.mobile_suits.ms_atk2dmg + item.ums_atk2dmg,
    skill3dmg: item.mobile_suits.ms_atk3dmg + item.ums_atk3dmg,
    pic: item.mobile_suits.ms_pic,
  }));

  return lineup;
}