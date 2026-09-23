import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // IN, OUT, ADJUSTMENT, all
    const productId = searchParams.get("productId");
    const limit = Number(searchParams.get("limit")) || 50;

    const where: any = {};
    if (type && type !== "all") {
      where.type = type;
    }
    if (productId && productId !== "all") {
      where.productId = productId;
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0);
    const totalCostValue = movements.reduce((sum, m) => sum + m.quantity * m.costPrice, 0);

    return NextResponse.json({
      movements,
      meta: {
        count: movements.length,
        totalQuantity,
        totalCostValue,
      },
    });
  } catch (error: any) {
    console.error("Stock movements get error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
