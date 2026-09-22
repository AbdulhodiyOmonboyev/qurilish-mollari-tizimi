import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      quantity,
      costPrice,
      salePrice,
      supplierId,
      recordAsExpense,
      paymentMethod,
      note,
    } = body;

    const qty = Number(quantity);
    if (!productId || !qty || qty <= 0) {
      return NextResponse.json(
        { error: "Tovar va musbat miqdor ko'rsatilishi shart" },
        { status: 400 }
      );
    }

    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!currentProduct) {
      return NextResponse.json({ error: "Tovar topilmadi" }, { status: 404 });
    }

    const newCost = costPrice !== undefined ? Number(costPrice) : currentProduct.costPrice;
    const newSale = salePrice !== undefined ? Number(salePrice) : currentProduct.salePrice;

    // Ombor qoldig'ini oshiramiz
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: { increment: qty },
        costPrice: newCost,
        salePrice: newSale,
      },
    });

    // Harakatlar tarixiga yozamiz
    await prisma.stockMovement.create({
      data: {
        productId,
        type: "IN",
        quantity: qty,
        costPrice: newCost,
        salePrice: newSale,
        referenceType: "purchase",
        referenceId: supplierId || null,
        note: note || "Omborga yangi partiya kirim qilindi",
      },
    });

    // Agar foydalanuvchi "Chiqim sifatida yozish"ni tanlagan bo'lsa
    if (recordAsExpense) {
      const expenseAmount = qty * newCost;
      let tovarCat = await prisma.expenseCategory.findFirst({
        where: { name: "Tovar xaridi" },
      });

      if (!tovarCat) {
        tovarCat = await prisma.expenseCategory.create({
          data: { name: "Tovar xaridi" },
        });
      }

      await prisma.expense.create({
        data: {
          categoryId: tovarCat.id,
          partnerId: supplierId || null,
          amount: expenseAmount,
          paymentMethod: paymentMethod || "CASH",
          note: `${currentProduct.name} - ${qty} ${currentProduct.unit} kirim qilindi`,
          date: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: "Omborga kirim muvaffaqiyatli bajarildi",
    });
  } catch (error: any) {
    console.error("Stock-in error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
