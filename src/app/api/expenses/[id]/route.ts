import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { categoryId, amount, paymentMethod, note, date } = body;

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Chiqim topilmadi" }, { status: 404 });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        categoryId: categoryId || expense.categoryId,
        amount: amount !== undefined ? Number(amount) : expense.amount,
        paymentMethod: paymentMethod || expense.paymentMethod,
        note: note !== undefined ? note : expense.note,
        date: date ? new Date(date) : expense.date,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Expense update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Chiqim topilmadi" }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Chiqim o'chirildi" });
  } catch (error: any) {
    console.error("Expense delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
