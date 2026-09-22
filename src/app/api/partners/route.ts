import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // STORE_CLIENT, SUPPLIER, all
    const hasDebt = searchParams.get("hasDebt"); // "true"

    const where: any = { isActive: true };
    if (type && type !== "all") {
      where.type = type;
    }
    if (hasDebt === "true") {
      where.totalDebt = { gt: 0 };
    }

    const partners = await prisma.partner.findMany({
      where,
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        debtPayments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
      orderBy: { totalDebt: "desc" },
    });

    const totalDebtSum = partners.reduce((sum, p) => sum + (p.totalDebt || 0), 0);

    return NextResponse.json({
      partners,
      meta: {
        totalPartners: partners.length,
        totalDebtSum,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, phone, address, contactPerson, initialDebt, note } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Hamkor nomi majburiy" },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: {
        name,
        type: type || "STORE_CLIENT",
        phone: phone || null,
        address: address || null,
        contactPerson: contactPerson || null,
        totalDebt: Number(initialDebt) || 0,
        note: note || null,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
