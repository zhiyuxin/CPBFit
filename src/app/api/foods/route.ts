import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const where: Record<string, unknown> = {};
  if (q) {
    where.name = { contains: q };
  }
  if (category) {
    where.category = category;
  }

  const foods = await prisma.foodItem.findMany({
    where: q || category ? where : {},
    orderBy: { category: "asc" },
    take: 50,
  });

  return NextResponse.json(foods);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, calories, protein, fat, carbs } = body;

    if (!name || !calories) {
      return NextResponse.json({ error: "名称和热量为必填项" }, { status: 400 });
    }

    const food = await prisma.foodItem.create({
      data: {
        name,
        category: category || "自定义",
        calories: parseFloat(calories),
        protein: protein ? parseFloat(protein) : null,
        fat: fat ? parseFloat(fat) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        unit: "份",
        unitGrams: 100,
      },
    });

    return NextResponse.json(food, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 400 });
  }
}
