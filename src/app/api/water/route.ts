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

  const records = await prisma.waterRecord.findMany({
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
  const { date, cups } = body;

  if (!date || cups === undefined) {
    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  }

  const dateObj = new Date(date);
  const existing = await prisma.waterRecord.findUnique({
    where: { userId_date: { userId, date: dateObj } },
  });

  if (existing) {
    const record = await prisma.waterRecord.update({
      where: { id: existing.id },
      data: { cups: parseInt(cups) },
    });
    return NextResponse.json(record);
  }

  const record = await prisma.waterRecord.create({
    data: { userId, date: dateObj, cups: parseInt(cups) },
  });
  return NextResponse.json(record, { status: 201 });
}
