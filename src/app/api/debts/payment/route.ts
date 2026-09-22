import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partnerId, amount, paymentMethod, note } = body;

    const payAmount = Number(amount);
    if (!partnerId || !payAmount || payAmount <= 0) {
      return NextResponse.json(
        { error: "Hamkor va to'lov summasi to'g'ri kiritilishi shart" },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json({ error: "Hamkor topilmadi" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.debtPayment.create({
        data: {
          partnerId,
          amount: payAmount,
          paymentMethod: paymentMethod || "CASH",
          note: note || "Nasiya qarzini to'lash",
        },
      });

      const updatedPartner = await tx.partner.update({
        where: { id: partnerId },
        data: {
          totalDebt: { decrement: payAmount },
        },
      });

      return { payment, updatedPartner };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `${payAmount.toLocaleString("uz-UZ")} so'm qarz to'lovi qabul qilindi`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
