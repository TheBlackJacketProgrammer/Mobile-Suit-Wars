import { NextResponse } from "next/server";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type RegisterBody = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as RegisterBody | null;

  const name = body?.name?.trim() ?? "";
  const username = body?.username?.trim() ?? "";
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  if (!name || !username || !email || !password) {
    return jsonError("Missing required fields.");
  }

  // Database schema constraints (per Prisma schema)
  if (username.length > 255) return jsonError("Username must be at most 255 characters.");
  if (email.length > 255) return jsonError("Email must be at most 255 characters.");

  // Current DB column is integer; keep compatibility with existing login.
  if (!/^\d+$/.test(password)) {
    return jsonError("Password must be numeric.");
  }

  const passwordInt = Number(password);
  if (!Number.isSafeInteger(passwordInt)) {
    return jsonError("Invalid password.");
  }

  const prisma = (await import("@/lib/prisma")).default;

  const maxRow = await prisma.user.aggregate({ _max: { u_id: true } });
  const nextId = (maxRow._max.u_id ?? 0) + 1;

  try {
    await prisma.user.create({
      data: {
        u_id: nextId,
        u_name: name,
        u_account: username,
        u_email: email,
        u_password: passwordInt,
        u_points: 10000,
        u_type: "User",
        u_status: "New",
      },
    });
  } 
  catch (err: unknown) {
    // Prisma unique constraint violation
    const e = err as { code?: string; meta?: { target?: unknown } };
    if (e?.code === "P2002") {
      const target = "Username or Email Address";
      return jsonError(`That ${target} is already in use.`, 409);
    }
    return jsonError("Registration failed.", 500);
  }

  return NextResponse.json({ ok: true });
}

