"use server";

import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { getMSLineUp } from "@/lib/getMSLineUp";

/** Latest lineup stats from DB (after rewards, armor, etc.). */
export async function fetchMSLineupForBattle() {
  const session = await getServerSession(authOptions);
  const raw = session?.user?.id;
  if (raw == null || !Number.isFinite(Number(raw))) {
    return [];
  }
  return getMSLineUp(Number(raw));
}
