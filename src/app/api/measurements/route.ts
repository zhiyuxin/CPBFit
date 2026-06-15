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

  const records = await prisma.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = await request.json();
  const { date, waistCm, hipCm, armCm, thighCm } = body;

  if (!date) {
    return NextResponse.json({ error: "缺少日期" }, { status: 400 });
  }

  const dateObj = new Date(date);
  const existing = await prisma.bodyMeasurement.findUnique({
    where: { userId_date: { userId, date: dateObj } },
  });

  const data = {
    waistCm: waistCm ? parseFloat(waistCm) : null,
    hipCm: hipCm ? parseFloat(hipCm) : null,
    armCm: armCm ? parseFloat(armCm) : null,
    thighCm: thighCm ? parseFloat(thighCm) : null,
  };

  if (existing) {
    const record = await prisma.bodyMeasurement.update({
      where: { id: existing.id },
      data,
    });
    return NextResponse.json(record);
  }

  const record = await prisma.bodyMeasurement.create({
    data: { userId, date: dateObj, ...data },
  });
  return NextResponse.json(record, { status: 201 });
}
