import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });
  return NextResponse.json(profile || {});
}

export async function PUT(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = await request.json();
  const { name, heightCm, goalKg, startKg } = body;

  let profile = await prisma.profile.findUnique({
    where: { userId },
  });

  const data = {
    ...(name !== undefined && { name }),
    ...(heightCm !== undefined && { heightCm: parseFloat(heightCm) }),
    ...(goalKg !== undefined && { goalKg: parseFloat(goalKg) }),
    ...(startKg !== undefined && { startKg: parseFloat(startKg) }),
  };

  if (profile) {
    profile = await prisma.profile.update({
      where: { userId },
      data,
    });
  } else {
    profile = await prisma.profile.create({
      data: { userId, ...data },
    });
  }

  return NextResponse.json(profile);
}
