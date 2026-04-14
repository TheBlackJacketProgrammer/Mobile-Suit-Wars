"use server";

import { cookies } from "next/headers";

export async function setPvpEnemy(enemyId: string) {
  const cookieStore = await cookies(); // ✅ FIX HERE

  cookieStore.set("pvp_enemy", enemyId, {
    httpOnly: true,
    path: "/",
  });
}