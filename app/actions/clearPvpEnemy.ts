"use server";

import { cookies } from "next/headers";

export async function clearPvpEnemy() {
    const cookieStore = await cookies();
    cookieStore.delete("pvp_enemy");
}