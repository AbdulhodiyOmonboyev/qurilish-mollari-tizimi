const { Bot, InlineKeyboard, Keyboard } = require("grammy");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const prisma = new PrismaClient();
const token = process.env.TELEGRAM_BOT_TOKEN;

const adminFilePath = path.join(__dirname, "admin_id.txt");
let adminId = process.env.ADMIN_TELEGRAM_ID;

if (!adminId && fs.existsSync(adminFilePath)) {
  try {
    adminId = fs.readFileSync(adminFilePath, "utf-8").trim();
  } catch (e) {}
}

if (!token || token === "YOUR_TELEGRAM_BOT_TOKEN_HERE") {
  console.log("---------------------------------------------------------");
  console.log("OGOHLANTIRISH: .env faylida TELEGRAM_BOT_TOKEN kiritilmagan!");
  console.log("---------------------------------------------------------");
  process.exit(1);
}

const bot = new Bot(token);

function formatMoney(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("uz-UZ").format(Math.round(num)) + " so'm";
}

function getAdminKeyboard() {
  return new Keyboard()
    .text("📊 Bugungi Hisobot")
    .text("⚠️ Kam qolgan tovarlar")
    .row()
    .text("📑 Do'konlar Qarzi")
    .text("📦 Ombor Holati")
    .row()
    .text("🛒 Onlayn Do'kon")
    .text("🔄 Yangilash")
    .resized();
}

function getClientKeyboard() {
  return new Keyboard()
    .text("📦 Mahsulotlar Katalogi")
    .text("🛒 Onlayn Do'kon")
    .row()
    .text("📞 Aloqa va Manzil")
    .text("🔐 Admin Rejimi")
    .resized();
}

// Start command
bot.command("start", async (ctx) => {
  const userId = ctx.from?.id.toString();

  // Agar admin hali belgilanmagan bo'lsa, birinchi start bosgan odam avtomatik admin bo'ladi
  if (!adminId) {
    adminId = userId;
    try {
      fs.writeFileSync(adminFilePath, userId);
    } catch (e) {}
  }

  const isAdmin = adminId && userId === adminId.toString();

  if (isAdmin) {
    await ctx.reply(
      `Assalomu alaykum, Xo'jayin! 🏪\n\nQurilish Mollari Boshqaruv Botingizga xush kelibsiz.\nSiz tizimda ADMIN sifatida biriktirildingiz (ID: ${userId}).\n\nQuyidagi menyu orqali do'koningizni to'liq boshqarishingiz mumkin:`,
      { reply_markup: getAdminKeyboard() }
    );
  } else {
    await ctx.reply(
      `Assalomu alaykum! Qurilish mollari do'konimizga xush kelibsiz! 🏗\n\nBu yerda siz tovarlar katalogi, narxlar va mavjud qoldiqlarni bilib olishingiz mumkin.`,
      { reply_markup: getClientKeyboard() }
    );
  }
});

// Admin rejimiga o'tish
bot.hears("🔐 Admin Rejimi", async (ctx) => {
  const userId = ctx.from?.id.toString();
  adminId = userId;
  try {
    fs.writeFileSync(adminFilePath, userId);
  } catch (e) {}

  await ctx.reply(
    `✅ Siz ADMIN sifatida tanildingiz! (ID: ${userId})\nEndi boshqaruv menyusidan foydalanishingiz mumkin:`,
    { reply_markup: getAdminKeyboard() }
  );
});

bot.command("admin", async (ctx) => {
  const userId = ctx.from?.id.toString();
  adminId = userId;
  try {
    fs.writeFileSync(adminFilePath, userId);
  } catch (e) {}

  await ctx.reply(
    `✅ Boshqaruv menyusi faollashtirildi!`,
    { reply_markup: getAdminKeyboard() }
  );
});

// Bugungi hisobot (Admin)
bot.hears(["📊 Bugungi Hisobot", "🔄 Yangilash"], async (ctx) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [orders, expenses] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: today }, status: { not: "CANCELLED" } },
      }),
      prisma.expense.findMany({
        where: { date: { gte: today } },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCost = orders.reduce((sum, o) => sum + o.totalCost, 0);
    const grossProfit = totalRevenue - totalCost;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;
    const cashCollected = orders.reduce((sum, o) => sum + o.paidAmount, 0);
    const debtGiven = orders.reduce((sum, o) => sum + o.debtAmount, 0);

    const msg =
      `📊 *BUGUNGI SAVDO VA MOLIYA HISOBOTI*\n` +
      `📅 Sana: ${new Date().toLocaleDateString("uz-UZ")}\n\n` +
      `💰 *Jami Savdo (Kirim):* ${formatMoney(totalRevenue)}\n` +
      `💵 *Kassaga tushgan naqd:* ${formatMoney(cashCollected)}\n` +
      `📝 *Nasiyaga berilgan:* ${formatMoney(debtGiven)}\n` +
      `📦 *Sotilgan tovar tannarxi:* ${formatMoney(totalCost)}\n` +
      `📉 *Bugungi chiqimlar:* ${formatMoney(totalExpenses)}\n` +
      `------------------------------------\n` +
      `💎 *SOF FOYDA:* ${formatMoney(netProfit)}\n` +
      `🧾 *Savdolar soni:* ${orders.length} ta\n\n` +
      `💡 _Tezkor chiqim kiritish uchun:_\n\`/chiqim <summa> <izoh>\``;

    await ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
    await ctx.reply("Hisobotni olishda xatolik yuz berdi.");
  }
});

// Kam qolgan tovarlar
bot.hears("⚠️ Kam qolgan tovarlar", async (ctx) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
    });

    const lowStock = products.filter((p) => p.stockQuantity <= p.minStockAlert);

    if (lowStock.length === 0) {
      await ctx.reply("✅ Ombordagi barcha tovarlar yetarli miqdorda mavjud!");
      return;
    }

    let msg = `⚠️ *OMBORDAGI KAM QOLGAN TOVARLAR (${lowStock.length} ta):*\n\n`;
    lowStock.forEach((p, idx) => {
      msg += `${idx + 1}. *${p.name}*\n`;
      msg += `   Qoldiq: *${p.stockQuantity} ${p.unit}* (Min chegara: ${p.minStockAlert})\n`;
      msg += `   Sotuv narxi: ${formatMoney(p.salePrice)}\n\n`;
    });

    await ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
    await ctx.reply("Ma'lumotlarni olishda xatolik.");
  }
});

// Do'konlar qarzlari
bot.hears("📑 Do'konlar Qarzi", async (ctx) => {
  try {
    const partners = await prisma.partner.findMany({
      where: { totalDebt: { gt: 0 } },
      orderBy: { totalDebt: "desc" },
    });

    if (partners.length === 0) {
      await ctx.reply("🎉 Ajoyib! Hozirda hech qaysi do'konning qarzi yo'q.");
      return;
    }

    const totalDebt = partners.reduce((sum, p) => sum + p.totalDebt, 0);
    let msg = `📑 *DO'KONLARNING NASIYA QARZLARI:*\n`;
    msg += `Jami qarz summasi: *${formatMoney(totalDebt)}*\n\n`;

    partners.forEach((p, idx) => {
      msg += `${idx + 1}. *${p.name}*\n`;
      msg += `   Qarzi: *${formatMoney(p.totalDebt)}*\n`;
      if (p.phone) msg += `   Tel: ${p.phone}\n`;
      msg += `\n`;
    });

    await ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
    await ctx.reply("Qarzlarni olishda xatolik.");
  }
});

// Ombor holati
bot.hears("📦 Ombor Holati", async (ctx) => {
  try {
    const products = await prisma.product.findMany({ where: { isActive: true } });
    const totalCost = products.reduce((sum, p) => sum + p.stockQuantity * p.costPrice, 0);
    const totalSale = products.reduce((sum, p) => sum + p.stockQuantity * p.salePrice, 0);

    const msg =
      `📦 *OMBOR UMUMIY QIYMATI:*\n\n` +
      `🔹 Jami tovar turlari: *${products.length} xil*\n` +
      `🔹 Ombor tannarx qiymati: *${formatMoney(totalCost)}*\n` +
      `🔹 Sotuvdagi umumiy qiymati: *${formatMoney(totalSale)}*\n` +
      `🔹 Kutilayotgan umumiy foyda: *${formatMoney(totalSale - totalCost)}*`;

    await ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
  }
});

// Tezkor chiqim kiritish: /chiqim <summa> <izoh>
bot.command("chiqim", async (ctx) => {
  try {
    const text = ctx.match;
    if (!text) {
      await ctx.reply(
        "ℹ️ Chiqim kiritish tartibi:\n`/chiqim <summa> <izoh>`\nMasalan: `/chiqim 200000 Oylik avans`",
        { parse_mode: "Markdown" }
      );
      return;
    }

    const parts = text.trim().split(" ");
    const amount = Number(parts[0]);
    const note = parts.slice(1).join(" ") || "Bot orqali kiritilgan xarajat";

    if (!amount || isNaN(amount) || amount <= 0) {
      await ctx.reply("❌ Xatolik: Summa to'g'ri raqam bo'lishi kerak.");
      return;
    }

    let defaultCat = await prisma.expenseCategory.findFirst({
      where: { name: "Boshqa xarajatlar" },
    });

    if (!defaultCat) {
      defaultCat = await prisma.expenseCategory.create({
        data: { name: "Boshqa xarajatlar" },
      });
    }

    await prisma.expense.create({
      data: {
        categoryId: defaultCat.id,
        amount,
        paymentMethod: "CASH",
        note,
        date: new Date(),
      },
    });

    await ctx.reply(
      `✅ Chiqim tizimga saqlandi!\n💰 Summa: *${formatMoney(amount)}*\n📝 Izoh: ${note}`,
      { parse_mode: "Markdown" }
    );
  } catch (e) {
    console.error(e);
    await ctx.reply("Chiqimni saqlashda xatolik.");
  }
});

// Mijozlar katalogi
bot.hears("📦 Mahsulotlar Katalogi", async (ctx) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 10,
    });

    let msg = `🏗 *ENG MASHHUR QURILISH MOLLARI:*\n\n`;
    products.forEach((p, idx) => {
      const isOut = p.stockQuantity <= 0;
      msg += `${idx + 1}. *${p.name}*\n`;
      msg += `   Narxi: *${formatMoney(p.salePrice)}* (1 ${p.unit})\n`;
      msg += `   Holat: ${isOut ? "❌ Sotuvda qolmagan" : `✅ Omborda mavjud (${p.stockQuantity} ${p.unit})`}\n\n`;
    });

    msg += `Barcha tovarlarni ko'rish va buyurtma berish uchun "🛒 Onlayn Do'kon" tugmasini bosing!`;
    await ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
  }
});

// Onlayn do'kon havola
bot.hears("🛒 Onlayn Do'kon", async (ctx) => {
  const shopUrl = process.env.APP_URL || "http://localhost:3000/shop";
  const keyboard = new InlineKeyboard().url("🛍 Onlayn Do'konni Ochish", shopUrl);

  await ctx.reply(
    `Bizning onlayn do'konimiz orqali real vaqtdagi ombor qoldiqlarini ko'rib, buyurtma berishingiz mumkin:`,
    { reply_markup: keyboard }
  );
});

// Aloqa
bot.hears("📞 Aloqa va Manzil", async (ctx) => {
  await ctx.reply(
    `📍 *Manzil:* Toshkent shahar, Qurilish bozori\n` +
      `📞 *Telefon:* +998 90 123 45 67\n` +
      `⏰ *Ish vaqti:* Dushanba - Yakshanba: 08:00 - 19:00\n\n` +
      `Savollaringiz bo'lsa, bemalol murojaat qilishingiz mumkin!`,
    { parse_mode: "Markdown" }
  );
});

bot.catch((err) => {
  console.error("Bot xatoligi:", err);
});

bot.start({
  onStart(botInfo) {
    console.log(`Telegram Bot @${botInfo.username} (ID: ${botInfo.id}) muvaffaqiyatli ishga tushdi!`);
  },
});
