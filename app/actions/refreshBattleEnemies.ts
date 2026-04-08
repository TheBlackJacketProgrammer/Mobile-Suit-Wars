"use server";

import { getRandomEnemyMS } from "./getRandomEnemyMS";

/** Fetches a new random trio of enemy mobile suits for the battle arena. */
export async function refreshBattleEnemies() {
  return getRandomEnemyMS();
}
