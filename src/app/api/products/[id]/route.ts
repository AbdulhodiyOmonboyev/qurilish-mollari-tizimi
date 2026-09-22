import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Tovar topilmadi" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      minStockAlert,
      description,
      imageUrl,
      isActive,
    } = body;

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        categoryId,
        code: code || null,
        barcode: barcode || null,
        unit,
        costPrice: Number(costPrice) || 0,
        salePrice: Number(salePrice) || 0,
        minStockAlert: Number(minStockAlert) || 10,
        description,
        imageUrl,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
