import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const userId = session.user.id;

  // Delete all user data in the right order (respect foreign keys)
  await prisma.$transaction([
    prisma.mealRecord.deleteMany({ where: { userId } }),
    prisma.weightRecord.deleteMany({ where: { userId } }),
    prisma.bodyMeasurement.deleteMany({ where: { userId } }),
    prisma.waterRecord.deleteMany({ where: { userId } }),
    prisma.notificationSetting.deleteMany({ where: { userId } }),
    prisma.progressPhoto.deleteMany({ where: { userId } }),
  ]);

  return NextResponse.json({ success: true });
}
