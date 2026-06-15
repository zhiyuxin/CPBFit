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

  const notifications = await prisma.notificationSetting.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  try {
    const body = await request.json();
    const { hour, minute, title, body: notifBody, repeatCount, enabled } = body;

    if (hour === undefined || minute === undefined || !notifBody) {
      return NextResponse.json({ error: "时间和通知内容为必填项" }, { status: 400 });
    }

    const notification = await prisma.notificationSetting.create({
      data: {
        userId,
        hour: parseInt(hour),
        minute: parseInt(minute),
        title: title || "WeightTrack",
        body: notifBody,
        repeatCount: repeatCount !== undefined ? parseInt(repeatCount) : 1,
        enabled: enabled !== undefined ? enabled : true,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, hour, minute, title, body: notifBody, repeatCount, enabled } = body;

    if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 });

    const existing = await prisma.notificationSetting.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "未找到" }, { status: 404 });

    const notification = await prisma.notificationSetting.update({
      where: { id },
      data: {
        ...(hour !== undefined && { hour: parseInt(hour) }),
        ...(minute !== undefined && { minute: parseInt(minute) }),
        ...(title !== undefined && { title }),
        ...(notifBody !== undefined && { body: notifBody }),
        ...(repeatCount !== undefined && { repeatCount: parseInt(repeatCount) }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("PUT /api/notifications error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 });

  const existing = await prisma.notificationSetting.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "未找到" }, { status: 404 });

  await prisma.notificationSetting.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
