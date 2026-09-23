import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { quantity, costPrice, salePrice, note } = body;

    const movement = await prisma.stockMovement.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!movement) {
      return NextResponse.json({ error: "Kirim/harakat topilmadi" }, { status: 404 });
    }

    const newQty = quantity !== undefined ? Number(quantity) : movement.quantity;
    if (newQty <= 0) {
      return NextResponse.json({ error: "Miqdor musbat bo'lishi shart" }, { status: 400 });
    }

    const newCost = costPrice !== undefined ? Number(costPrice) : movement.costPrice;
    const newSale = salePrice !== undefined ? Number(salePrice) : movement.salePrice;

    // Tranzaksiya bilan ombor qoldig'ini va harakatni yangilash
    const result = await prisma.$transaction(async (tx) => {
      // Agar bu Kirim (IN) bo'lsa, qoldiqqa farqni qo'shamiz
      if (movement.type === "IN") {
        const qtyDiff = newQty - movement.quantity;
        await tx.product.update({
          where: { id: movement.productId },
          data: {
            stockQuantity: { increment: qtyDiff },
            costPrice: newCost,
            salePrice: newSale,
          },
        });
      } else if (movement.type === "OUT") {
        const qtyDiff = newQty - movement.quantity;
        await tx.product.update({
          where: { id: movement.productId },
          data: {
            stockQuantity: { decrement: qtyDiff },
          },
        });
      }

      const updatedMovement = await tx.stockMovement.update({
        where: { id },
        data: {
          quantity: newQty,
          costPrice: newCost,
          salePrice: newSale,
          note: note !== undefined ? note : movement.note,
        },
        include: {
          product: true,
        },
      });

      return updatedMovement;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Stock movement update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const movement = await prisma.stockMovement.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!movement) {
      return NextResponse.json({ error: "Harakat topilmadi" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Kirim bekor qilinsa, ombor qoldig'idan ayiramiz
      if (movement.type === "IN") {
        await tx.product.update({
          where: { id: movement.productId },
          data: {
            stockQuantity: { decrement: movement.quantity },
          },
        });
      } else if (movement.type === "OUT") {
        // Chiqim bekor qilinsa, omborga qaytaramiz
        await tx.product.update({
          where: { id: movement.productId },
          data: {
            stockQuantity: { increment: movement.quantity },
          },
        });
      }

      await tx.stockMovement.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "Kirim/harakat bekor qilindi" });
  } catch (error: any) {
    console.error("Stock movement delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
