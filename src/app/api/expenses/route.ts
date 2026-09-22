import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        partner: true,
      },
      orderBy: { date: "desc" },
    });

    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
    });

    const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      expenses,
      categories,
      meta: {
        totalExpenseAmount,
        count: expenses.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, categoryName, amount, partnerId, paymentMethod, note, date } = body;

    const expAmount = Number(amount);
    if (!expAmount || expAmount <= 0) {
      return NextResponse.json(
        { error: "Xarajat summasi musbat bo'lishi shart" },
        { status: 400 }
      );
    }

    let targetCategoryId = categoryId;
    if (!targetCategoryId && categoryName) {
      let cat = await prisma.expenseCategory.findFirst({
        where: { name: categoryName },
      });
      if (!cat) {
        cat = await prisma.expenseCategory.create({
          data: { name: categoryName },
        });
      }
      targetCategoryId = cat.id;
    }

    if (!targetCategoryId) {
      return NextResponse.json(
        { error: "Kategoriya ko'rsatilishi shart" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        categoryId: targetCategoryId,
        partnerId: partnerId || null,
        amount: expAmount,
        paymentMethod: paymentMethod || "CASH",
        note: note || null,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
