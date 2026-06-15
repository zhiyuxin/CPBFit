import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const records = await prisma.bodyMeasurement.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, waistCm, hipCm, armCm, thighCm } = body;

  if (!date) {
    return NextResponse.json({ error: "缺少日期" }, { status: 400 });
  }

  const dateObj = new Date(date);
  const existing = await prisma.bodyMeasurement.findUnique({
    where: { date: dateObj },
  });

  const data = {
    waistCm: waistCm ? parseFloat(waistCm) : null,
    hipCm: hipCm ? parseFloat(hipCm) : null,
    armCm: armCm ? parseFloat(armCm) : null,
    thighCm: thighCm ? parseFloat(thighCm) : null,
  };

  if (existing) {
    const record = await prisma.bodyMeasurement.update({
      where: { date: dateObj },
      data,
    });
    return NextResponse.json(record);
  }

  const record = await prisma.bodyMeasurement.create({
    data: { date: dateObj, ...data },
  });
  return NextResponse.json(record, { status: 201 });
}
