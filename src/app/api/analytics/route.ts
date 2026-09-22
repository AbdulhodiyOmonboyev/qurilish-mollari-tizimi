import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // "today", "week", "month", "year", "all"

    const now = new Date();
    let startDate = new Date();

    if (period === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate.setDate(now.getDate() - 30);
    } else if (period === "year") {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate = new Date(0); // All time
    }

    // 1. Savdolar (Orders)
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: "CANCELLED" },
      },
      include: {
        items: true,
      },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0); // Jami savdo (Kirim)
    const totalCostOfGoods = orders.reduce((sum, o) => sum + o.totalCost, 0); // Sotilgan tovar tannarxi
    const grossProfit = totalRevenue - totalCostOfGoods; // Yalpi foyda
    const totalCashCollected = orders.reduce((sum, o) => sum + o.paidAmount, 0); // Amalda kassa tushumi
    const totalCreditGiven = orders.reduce((sum, o) => sum + o.debtAmount, 0); // Nasiyaga ketgan qism

    // 2. Chiqimlar (Expenses)
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: startDate },
      },
      include: {
        category: true,
      },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 3. Sof Foyda formulasi:
    // Sof Foyda = Jami Savdo (totalRevenue) - Sotilgan tovar tannarxi (totalCostOfGoods) - Chiqimlar (totalExpenses)
    const netProfit = grossProfit - totalExpenses;

    // Chiqimlar bo'yicha taqsimot (kategoriya bo'yicha)
    const expensesByCategory: Record<string, number> = {};
    for (const exp of expenses) {
      const catName = exp.category.name;
      expensesByCategory[catName] = (expensesByCategory[catName] || 0) + exp.amount;
    }

    // 4. Qarzlar (Barcha hamkorlarning hozirgi qarzi)
    const partnersWithDebt = await prisma.partner.findMany({
      where: {
        totalDebt: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        totalDebt: true,
      },
      orderBy: { totalDebt: "desc" },
    });
    const totalPendingDebts = partnersWithDebt.reduce((sum, p) => sum + p.totalDebt, 0);

    // 5. Har bir tovar bo'yicha foyda marjasi va sotuv soni
    const products = await prisma.product.findMany({
      include: {
        category: true,
        orderItems: {
          where: {
            order: {
              createdAt: { gte: startDate },
              status: { not: "CANCELLED" },
            },
          },
        },
      },
    });

    const productMargins = products.map((p) => {
      const marginPerUnit = p.salePrice - p.costPrice;
      const marginPercentage =
        p.costPrice > 0 ? ((marginPerUnit / p.costPrice) * 100).toFixed(1) : "0";

      const totalSoldUnits = p.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
      const totalSoldAmount = p.orderItems.reduce((sum, oi) => sum + oi.totalPrice, 0);
      const totalProfitFromProduct = p.orderItems.reduce(
        (sum, oi) => sum + (oi.totalPrice - oi.costPrice * oi.quantity),
        0
      );

      return {
        id: p.id,
        name: p.name,
        categoryName: p.category.name,
        unit: p.unit,
        costPrice: p.costPrice,
        salePrice: p.salePrice,
        stockQuantity: p.stockQuantity,
        minStockAlert: p.minStockAlert,
        marginPerUnit,
        marginPercentage,
        totalSoldUnits,
        totalSoldAmount,
        totalProfitFromProduct,
      };
    });

    // Eng ko'p foyda keltirgan 5 ta tovar
    const topProducts = [...productMargins]
      .sort((a, b) => b.totalSoldUnits - a.totalSoldUnits)
      .slice(0, 5);

    // 6. Kunlik grafik ma'lumotlari (oxirgi 7 yoki 30 kun)
    const dailyData: Record<string, { date: string; revenue: number; expense: number; profit: number }> = {};
    
    // So'nggi 7 kun uchun boshlang'ich kalitlar
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyData[key] = { date: key.slice(5), revenue: 0, expense: 0, profit: 0 };
    }

    orders.forEach((o) => {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (dailyData[key]) {
        dailyData[key].revenue += o.totalAmount;
        dailyData[key].profit += (o.totalAmount - o.totalCost);
      }
    });

    expenses.forEach((e) => {
      const key = new Date(e.date).toISOString().slice(0, 10);
      if (dailyData[key]) {
        dailyData[key].expense += e.amount;
        dailyData[key].profit -= e.amount;
      }
    });

    return NextResponse.json({
      period,
      summary: {
        totalRevenue,
        totalCostOfGoods,
        grossProfit,
        totalExpenses,
        netProfit,
        totalCashCollected,
        totalCreditGiven,
        totalPendingDebts,
        orderCount: orders.length,
      },
      expensesByCategory: Object.entries(expensesByCategory).map(([name, value]) => ({
        name,
        value,
      })),
      topProducts,
      productMargins,
      dailyChart: Object.values(dailyData),
      partnersWithDebt,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
