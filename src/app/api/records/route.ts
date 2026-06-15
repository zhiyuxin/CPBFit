import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await prisma.weightRecord.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  try {
    const body = await request.json();
    const { date, weightKg, note } = body;

    if (!date || !weightKg) {
      return NextResponse.json(
        { error: "日期和体重为必填项" },
        { status: 400 }
      );
    }

    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "无效的日期格式" },
        { status: 400 }
      );
    }

    const existing = await prisma.weightRecord.findUnique({
      where: { userId_date: { userId, date: dateObj } },
    });

    if (existing) {
      const record = await prisma.weightRecord.update({
        where: { id: existing.id },
        data: { weightKg: parseFloat(weightKg), note: note || null },
      });
      return NextResponse.json(record);
    }

    const record = await prisma.weightRecord.create({
      data: {
        userId,
        date: dateObj,
        weightKg: parseFloat(weightKg),
        note: note || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("POST /api/records error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "请求格式错误" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少记录 ID" }, { status: 400 });
  }

  // Only delete if it belongs to the current user
  const record = await prisma.weightRecord.findFirst({
    where: { id, userId },
  });
  if (!record) return NextResponse.json({ error: "无权删除" }, { status: 403 });

  await prisma.weightRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
