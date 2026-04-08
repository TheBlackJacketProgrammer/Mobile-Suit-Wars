import prisma from "@/lib/prisma";

export async function createCharacter(data: {
  name: string;
  imageUrl: string;
  mid: string;
  cost: string;
  armor: number;
  level: number;
  exp: number;
  basicAtkdmg: number;
  atk1: string;
  atk2: string;
  atk3: string;
  atk1dmg: number;
  atk2dmg: number;
  atk3dmg: number;
}) {
  return await prisma.mobile_suits.create({
    data: {
      ms_mid: data.mid,
      ms_name: data.name,
      ms_pic: data.imageUrl,
      ms_cost: data.cost,
      ms_armor: data.armor,
      ms_level: data.level,
      ms_exp: data.exp,
      ms_basicAtkdmg: data.basicAtkdmg,
      ms_atk1: data.atk1,
      ms_atk2: data.atk2,
      ms_atk3: data.atk3,
      ms_atk1dmg: data.atk1dmg,
      ms_atk2dmg: data.atk2dmg,
      ms_atk3dmg: data.atk3dmg,
    },
  });
}