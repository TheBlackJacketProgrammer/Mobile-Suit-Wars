import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getMSLineUp } from "@/lib/getMSLineUp";
import BattleArenaClient from "./BattleArenaClient";
import { getRandomEnemyMS } from "../actions/getRandomEnemyMS";

export default async function BattleArena() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const lineup =
    userId != null && Number.isFinite(Number(userId))
      ? await getMSLineUp(Number(userId))
      : [];

  const enemyMS = await getRandomEnemyMS();

  return (
    <BattleArenaClient
      lineup={lineup}
      enemyMS={enemyMS}
      userId={
        userId != null && Number.isFinite(Number(userId))
          ? Number(userId)
          : null
      }
    />
  );
}
