import prisma from "@/lib/prisma";

export async function createCharacter(data: {
  msId?: number;
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
  const costNum = (() => {
    const digits = String(data.cost ?? "").replace(/\D/g, "");
    const n = digits.length > 0 ? parseInt(digits, 10) : Number(data.cost);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  })();

  const msId =
    typeof data.msId === "number" && Number.isInteger(data.msId) && data.msId > 0
      ? data.msId
      : ((await prisma.mobile_suits.aggregate({ _max: { ms_id: true } }))._max
          .ms_id ?? 0) + 1;

  return await prisma.mobile_suits.create({
    data: {
      ms_id: msId,
      ms_mid: data.mid,
      ms_name: data.name,
      ms_pic: data.imageUrl,
      ms_cost: costNum,
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