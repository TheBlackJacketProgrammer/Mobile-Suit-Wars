"use server";

import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";

export async function getUserId() {
    const session = await getServerSession(authOptions);
    return session?.user?.id;
}