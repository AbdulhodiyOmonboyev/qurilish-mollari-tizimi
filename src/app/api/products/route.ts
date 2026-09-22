import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const query = searchParams.get("q") || "";
    const filter = searchParams.get("filter"); // "low_stock"

    const where: any = {
      isActive: true,
    };

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { code: { contains: query } },
        { barcode: { contains: query } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    let filtered = products;
    if (filter === "low_stock") {
      filtered = products.filter((p) => p.stockQuantity <= p.minStockAlert);
    }

    // Ombor umumiy qiymatini hisoblash
    const totalCostValue = products.reduce(
      (sum, p) => sum + p.stockQuantity * p.costPrice,
      0
    );
    const totalSaleValue = products.reduce(
      (sum, p) => sum + p.stockQuantity * p.salePrice,
      0
    );
    const lowStockCount = products.filter(
      (p) => p.stockQuantity <= p.minStockAlert
    ).length;

    return NextResponse.json({
      products: filtered,
      meta: {
        totalProducts: products.length,
        totalCostValue,
        totalSaleValue,
        expectedProfit: totalSaleValue - totalCostValue,
        lowStockCount,
      },
    });
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { error: "Mahsulotlarni olishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      categoryId,
      code,
      barcode,
      unit,
      costPrice,
      salePrice,
      stockQuantity,
      minStockAlert,
      description,
      imageUrl,
    } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Nomi va kategoriyasi majburiy" },
        { status: 400 }
      );
    }

    const initialStock = Number(stockQuantity) || 0;
    const cost = Number(costPrice) || 0;
    const sale = Number(salePrice) || 0;

    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        code: code || null,
        barcode: barcode || null,
        unit: unit || "dona",
        costPrice: cost,
        salePrice: sale,
        stockQuantity: initialStock,
        minStockAlert: Number(minStockAlert) || 10,
        description,
        imageUrl,
      },
    });

    // Agar boshlang'ich qoldiq ko'rsatilgan bo'lsa, harakatlar tarixiga yozamiz
    if (initialStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: initialStock,
          costPrice: cost,
          salePrice: sale,
          referenceType: "manual",
          note: "Boshlang'ich zaxira kiritildi",
        },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Product POST error:", error);
    return NextResponse.json(
      { error: error.message || "Tovar qo'shishda xatolik" },
      { status: 500 }
    );
  }
}
