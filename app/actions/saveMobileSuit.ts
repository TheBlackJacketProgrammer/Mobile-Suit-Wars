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
  const mid = String(ms.ms_mid ?? "").trim();
  const name = String(ms.ms_name ?? "").trim();
  if (!mid || !name) {
    return { ok: false, error: "MS Code and Name are required." };
  }

  const base = {
    ms_mid: mid,
    ms_name: name,
    ms_pic: String(ms.ms_pic ?? "").trim(),
    ms_cost: num(ms.ms_cost ?? 0),
    ms_armor: num(ms.ms_armor ?? 0),
    ms_level: num(ms.ms_level ?? 1),
    ms_exp: num(ms.ms_exp ?? 0),
    ms_basicAtkdmg: num(ms.ms_basicAtkdmg ?? 0),
    ms_atk1: String(ms.ms_atk1 ?? "").trim(),
    ms_atk2: String(ms.ms_atk2 ?? "").trim(),
    ms_atk3: String(ms.ms_atk3 ?? "").trim(),
    ms_atk1dmg: num(ms.ms_atk1dmg ?? 0),
    ms_atk2dmg: num(ms.ms_atk2dmg ?? 0),
    ms_atk3dmg: num(ms.ms_atk3dmg ?? 0),
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

    const nextId =
      ((await prisma.mobile_suits.aggregate({ _max: { ms_id: true } }))._max
        .ms_id ?? 0) + 1;
    const created = await prisma.mobile_suits.create({
      data: { ms_id: nextId, ...base },
    });
    revalidatePath("/ms-core");
    return { ok: true, ms_id: created.ms_id };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not save mobile suit.";
    return { ok: false, error: message };
  }
}
