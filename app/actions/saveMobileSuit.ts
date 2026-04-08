"use server";

import type { mobile_suits } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function num(n: number, fallback = 0) {
  return Number.isFinite(n) ? n : fallback;
}

export async function saveMobileSuit(
  ms: mobile_suits
): Promise<
  { ok: true; ms_id: number } | { ok: false; error: string }
> {
  const mid = ms.ms_mid.trim();
  const name = ms.ms_name.trim();
  if (!mid || !name) {
    return { ok: false, error: "MS Code and Name are required." };
  }

  const base = {
    ms_mid: mid,
    ms_name: name,
    ms_pic: ms.ms_pic.trim(),
    ms_cost: ms.ms_cost.trim(),
    ms_armor: num(ms.ms_armor),
    ms_level: num(ms.ms_level),
    ms_exp: num(ms.ms_exp),
    ms_basicAtkdmg: num(ms.ms_basicAtkdmg),
    ms_atk1: ms.ms_atk1.trim(),
    ms_atk2: ms.ms_atk2.trim(),
    ms_atk3: ms.ms_atk3.trim(),
    ms_atk1dmg: num(ms.ms_atk1dmg),
    ms_atk2dmg: num(ms.ms_atk2dmg),
    ms_atk3dmg: num(ms.ms_atk3dmg),
    ms_atk1Eff: ms.ms_atk1Eff?.trim() || null,
    ms_atk2Eff: ms.ms_atk2Eff?.trim() || null,
    ms_atk3Eff: ms.ms_atk3Eff?.trim() || null,
  };

  try {
    if (ms.ms_id > 0) {
      await prisma.mobile_suits.update({
        where: { ms_id: ms.ms_id },
        data: base,
      });
      revalidatePath("/ms-core");
      return { ok: true, ms_id: ms.ms_id };
    }

    const created = await prisma.mobile_suits.create({ data: base });
    revalidatePath("/ms-core");
    return { ok: true, ms_id: created.ms_id };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not save mobile suit.";
    return { ok: false, error: message };
  }
}
