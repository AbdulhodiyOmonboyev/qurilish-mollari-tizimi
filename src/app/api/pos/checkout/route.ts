import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items, // [{ productId, quantity, unitPrice }]
      partnerId,
      customerName,
      customerPhone,
      deliveryAddress,
      paidAmount,
      paymentMethod, // CASH, CARD, TRANSFER, DEBT, MIXED
      dueDate,
      note,
      source = "POS", // POS, ONLINE, TELEGRAM
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Kamida bitta tovar tanlanishi shart" },
        { status: 400 }
      );
    }

    // Har bir tovarni tekshirib, ma'lumotlarini olish
    let calculatedTotalAmount = 0;
    let calculatedTotalCost = 0;
    const orderItemsData: any[] = [];
    const stockUpdates: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Tovar topilmadi: ${item.productId}` },
          { status: 404 }
        );
      }

      const qty = Number(item.quantity);
      if (qty <= 0) {
        return NextResponse.json(
          { error: `${product.name} miqdori noto'g'ri ko'rsatilgan` },
          { status: 400 }
        );
      }

      const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : product.salePrice;
      const itemTotal = qty * unitPrice;
      const itemCost = qty * product.costPrice;

      calculatedTotalAmount += itemTotal;
      calculatedTotalCost += itemCost;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        quantity: qty,
        costPrice: product.costPrice,
        unitPrice: unitPrice,
        totalPrice: itemTotal,
      });

      stockUpdates.push({
        productId: product.id,
        decrementQty: qty,
        costPrice: product.costPrice,
        salePrice: unitPrice,
      });
    }

    const totalPaid = Number(paidAmount) || 0;
    const debt = Math.max(0, calculatedTotalAmount - totalPaid);

    let paymentStatus = "PAID";
    if (debt > 0) {
      paymentStatus = totalPaid > 0 ? "PARTIAL" : "DEBT";
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

    // Tranzaksiyani Prisma orqali xavfsiz bajarish
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buyurtmani yaratish
      const order = await tx.order.create({
        data: {
          orderNumber,
          partnerId: partnerId || null,
          source,
          status: "COMPLETED",
          totalAmount: calculatedTotalAmount,
          totalCost: calculatedTotalCost,
          paidAmount: totalPaid,
          debtAmount: debt,
          paymentStatus,
          paymentMethod: paymentMethod || (debt > 0 ? "DEBT" : "CASH"),
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          deliveryAddress: deliveryAddress || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          note: note || null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
          partner: true,
        },
      });

      // 2. Ombordan tovarlarni yechish va harakatlarni qayd etish
      for (const update of stockUpdates) {
        await tx.product.update({
          where: { id: update.productId },
          data: {
            stockQuantity: { decrement: update.decrementQty },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: update.productId,
            type: "OUT",
            quantity: update.decrementQty,
            costPrice: update.costPrice,
            salePrice: update.salePrice,
            referenceType: "sale",
            referenceId: order.id,
            note: `Savdo cheki: ${orderNumber}`,
          },
        });
      }

      // 3. Agar hamkor do'konga nasiya qilingan bo'lsa
      if (partnerId) {
        if (debt > 0) {
          await tx.partner.update({
            where: { id: partnerId },
            data: {
              totalDebt: { increment: debt },
            },
          });
        }

        // To'langan qismi bo'lsa, to'lov tarixiga yozamiz
        if (totalPaid > 0) {
          await tx.debtPayment.create({
            data: {
              partnerId,
              orderId: order.id,
              amount: totalPaid,
              paymentMethod: paymentMethod === "MIXED" ? "CASH" : paymentMethod || "CASH",
              note: `Savdo paytida to'landi (${orderNumber})`,
            },
          });
        }
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      order: result,
      message: "Savdo muvaffaqiyatli yakunlandi",
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
