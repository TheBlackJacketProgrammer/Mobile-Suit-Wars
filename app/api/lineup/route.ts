import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = Number(url.searchParams.get("userId"));

  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 });
  }

  try {
    const result = await prisma.$queryRaw`CALL GetUserLineupMobileSuits(${userId})`;

    const payload =
      Array.isArray(result) && result.length > 0 ? result[0] : result;

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to fetch lineup", error);
    return NextResponse.json({ error: "Failed to fetch lineup" }, { status: 500 });
  }
}
