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
  const date = searchParams.get("date");

  const where: Record<string, unknown> = { userId };
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where.date = { gte: start, lte: end };
  }

  const meals = await prisma.mealRecord.findMany({
    where,
    include: { food: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(meals);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  try {
    const body = await request.json();
    const { date, mealType, foodId, grams } = body;

    if (!date || !mealType || !foodId || !grams) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const food = await prisma.foodItem.findUnique({ where: { id: foodId } });
    if (!food) {
      return NextResponse.json({ error: "食物不存在" }, { status: 404 });
    }

    const gramsNum = parseFloat(grams);
    const calories = Math.round((food.calories * gramsNum) / 100);

    const meal = await prisma.mealRecord.create({
      data: {
        userId,
        date: new Date(date),
        mealType,
        foodId,
        grams: gramsNum,
        calories,
      },
      include: { food: true },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error("POST /api/meals error:", error);
    return NextResponse.json({ error: "记录失败" }, { status: 400 });
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

  const meal = await prisma.mealRecord.findFirst({ where: { id, userId } });
  if (!meal) return NextResponse.json({ error: "无权删除" }, { status: 403 });

  await prisma.mealRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
