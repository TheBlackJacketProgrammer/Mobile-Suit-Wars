import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getMSLineUp } from "@/lib/getMSLineUp";
import BattleArenaClient from "./BattleArenaClient";
import { getRandomEnemyMS } from "../actions/getRandomEnemyMS";
import { getEnemyUserLineUp } from "../actions/getEnemyUserLineUp";
import { cookies } from "next/headers";

export async function getCookieStore() {
  return await cookies();
}

export default async function BattleArena() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const cookieStore = await cookies();
  const enemyId = cookieStore.get("pvp_enemy")?.value;
  const lineup =
    userId != null && Number.isFinite(Number(userId))
      ? await getMSLineUp(Number(userId))
      : [];

  let enemyMS = await getRandomEnemyMS();  
  if (enemyId) {
    enemyMS = await getEnemyUserLineUp(enemyId);
  }

  

  return (
    <BattleArenaClient
      lineup={lineup}
      enemyMS={enemyMS}
      userId={
        userId != null && Number.isFinite(Number(userId))
          ? Number(userId)
          : null
      }
      enemyName={enemyId ? `${enemyId}'s Units` : "Enemy AI's Units"}
    />
  );
}
