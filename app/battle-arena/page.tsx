import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getMSLineUp } from "@/lib/getMSLineUp";
import BattleArenaClient from "./BattleArenaClient";

export default async function BattleArena() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const lineup =
    userId != null && Number.isFinite(Number(userId))
      ? await getMSLineUp(Number(userId))
      : [];

  return <BattleArenaClient lineup={lineup} />;
}
