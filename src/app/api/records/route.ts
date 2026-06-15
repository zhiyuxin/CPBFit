import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await prisma.weightRecord.findMany({
    where: { date: { gte: since } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, weightKg, note } = body;

    console.log("POST /api/records body:", { date, weightKg, note });

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
      where: { date: dateObj },
    });

    if (existing) {
      const record = await prisma.weightRecord.update({
        where: { date: dateObj },
        data: { weightKg: parseFloat(weightKg), note: note || null },
      });
      return NextResponse.json(record);
    }

    const record = await prisma.weightRecord.create({
      data: {
        date: dateObj,
        weightKg: parseFloat(weightKg),
        note: note || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    console.error("POST /api/records error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "请求格式错误" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少记录 ID" }, { status: 400 });
  }

  await prisma.weightRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
