import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source"); // POS, ONLINE, TELEGRAM, all
    const paymentStatus = searchParams.get("paymentStatus"); // PAID, PARTIAL, DEBT, all
    const partnerId = searchParams.get("partnerId");

    const where: any = {};
    if (source && source !== "all") where.source = source;
    if (paymentStatus && paymentStatus !== "all") where.paymentStatus = paymentStatus;
    if (partnerId) where.partnerId = partnerId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        partner: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
