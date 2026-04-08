import prisma from "@/lib/prisma";

const ENEMY_SLOT_COUNT = 3;

/** Pick `count` distinct random elements from `ids` (mutates a copy of the pool). */
function pickDistinctRandomIds(ids: number[], count: number): number[] {
  const pool = [...ids];
  const n = Math.min(count, pool.length);
  const chosen: number[] = [];
  for (let i = 0; i < n; i++) {
    const j = Math.floor(Math.random() * pool.length);
    chosen.push(pool.splice(j, 1)[0]!);
  }
  return chosen;
}

export async function getRandomEnemyMS() {
  const idRows = await prisma.mobile_suits.findMany({
    select: { ms_id: true },
  });

  if (idRows.length === 0) {
    return [];
  }

  const chosenIds = pickDistinctRandomIds(
    idRows.map((r) => r.ms_id),
    ENEMY_SLOT_COUNT,
  );

  const suits = await prisma.mobile_suits.findMany({
    where: { ms_id: { in: chosenIds } },
  });

  const order = new Map(chosenIds.map((id, idx) => [id, idx]));
  suits.sort(
    (a, b) => (order.get(a.ms_id) ?? 0) - (order.get(b.ms_id) ?? 0),
  );

  return suits;
}
