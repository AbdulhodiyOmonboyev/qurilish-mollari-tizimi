import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const newCount = await prisma.application.count({
      where: { status: "YANGI" },
    });

    return NextResponse.json({
      applications,
      meta: {
        total: applications.length,
        newCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, organization, address, requestedItems, note } = body;

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Ismingiz va telefon raqamingizni kiritishingiz shart" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        fullName,
        phone,
        organization: organization || null,
        address: address || null,
        requestedItems: requestedItems || null,
        note: note || null,
        status: "YANGI",
      },
    });

    // Telegram Bot orqali Adminga xabarnoma yuborish
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      let adminId = process.env.ADMIN_TELEGRAM_ID;
      const adminFilePath = path.join(process.cwd(), "scripts", "admin_id.txt");

      if (!adminId && fs.existsSync(adminFilePath)) {
        adminId = fs.readFileSync(adminFilePath, "utf-8").trim();
      }

      if (token && adminId) {
        const text =
          `🔔 *YANGI ARIZA KELIB TUSHDI!*\n\n` +
          `👤 *Mijoz:* ${fullName}\n` +
          `📞 *Telefon:* ${phone}\n` +
          (organization ? `🏢 *Obyekt/Tashkilot:* ${organization}\n` : "") +
          (address ? `📍 *Manzil:* ${address}\n` : "") +
          (requestedItems ? `📦 *Materiallar:* ${requestedItems}\n` : "") +
          (note ? `💬 *Izoh:* ${note}\n` : "") +
          `\nBoshqaruv panelida ko'rish: /dashboard`;

        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: adminId,
            text,
            parse_mode: "Markdown",
          }),
        });
      }
    } catch (botErr) {
      console.error("Telegram notification error:", botErr);
    }

    return NextResponse.json(
      {
        success: true,
        application,
        message: "Arizangiz muvaffaqiyatli qabul qilindi. Tez orada bog'lanamiz!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
