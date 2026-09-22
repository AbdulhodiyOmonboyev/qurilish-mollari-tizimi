import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const tokenUser = await getCurrentUser();
  if (!tokenUser) {
    return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenUser.userId },
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
      phone: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Foydalanuvchi topilmadi yoki faol emas" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
