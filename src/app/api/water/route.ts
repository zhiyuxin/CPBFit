import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const records = await prisma.waterRecord.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, cups } = body;

  if (!date || cups === undefined) {
    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  }

  const dateObj = new Date(date);
  const existing = await prisma.waterRecord.findUnique({
    where: { date: dateObj },
  });

  if (existing) {
    const record = await prisma.waterRecord.update({
      where: { date: dateObj },
      data: { cups: parseInt(cups) },
    });
    return NextResponse.json(record);
  }

  const record = await prisma.waterRecord.create({
    data: { date: dateObj, cups: parseInt(cups) },
  });
  return NextResponse.json(record, { status: 201 });
}
