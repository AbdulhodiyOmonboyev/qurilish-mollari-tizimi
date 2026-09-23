import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: true,
          },
          orderBy: { createdAt: "desc" },
        },
        debtPayments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: "Hamkor topilmadi" }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error: any) {
    console.error("Partner get error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, type, phone, address, contactPerson, totalDebt, note, isActive } = body;

    const partner = await prisma.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      return NextResponse.json({ error: "Hamkor topilmadi" }, { status: 404 });
    }

    const updated = await prisma.partner.update({
      where: { id },
      data: {
        name: name !== undefined ? name : partner.name,
        type: type !== undefined ? type : partner.type,
        phone: phone !== undefined ? phone : partner.phone,
        address: address !== undefined ? address : partner.address,
        contactPerson: contactPerson !== undefined ? contactPerson : partner.contactPerson,
        totalDebt: totalDebt !== undefined ? Number(totalDebt) : partner.totalDebt,
        note: note !== undefined ? note : partner.note,
        isActive: isActive !== undefined ? isActive : partner.isActive,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Partner update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const partner = await prisma.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      return NextResponse.json({ error: "Hamkor topilmadi" }, { status: 404 });
    }

    // O'chirish
    await prisma.partner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Hamkor o'chirildi" });
  } catch (error: any) {
    console.error("Partner delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
