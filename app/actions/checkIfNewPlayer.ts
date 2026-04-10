"use server";

import prisma from "@/lib/prisma";
import { getUserId } from "./getUserId";

export async function checkIfNewPlayer() {
  const u_id = Number(await getUserId());

  // Step 1: get MS records
  const user = await prisma.user.findUnique({
    where: {
      u_id: u_id
    },
  });

  const userStatus = user?.u_status;

  return userStatus;
}