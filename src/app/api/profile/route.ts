import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await prisma.profile.findFirst();
  return NextResponse.json(profile || {});
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { name, heightCm, goalKg, startKg } = body;

  let profile = await prisma.profile.findFirst();
  if (profile) {
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        ...(name !== undefined && { name }),
        ...(heightCm !== undefined && { heightCm: parseFloat(heightCm) }),
        ...(goalKg !== undefined && { goalKg: parseFloat(goalKg) }),
        ...(startKg !== undefined && { startKg: parseFloat(startKg) }),
      },
    });
  } else {
    profile = await prisma.profile.create({
      data: {
        name: name || "我",
        heightCm: heightCm ? parseFloat(heightCm) : null,
        goalKg: goalKg ? parseFloat(goalKg) : null,
        startKg: startKg ? parseFloat(startKg) : null,
      },
    });
  }

  return NextResponse.json(profile);
}
