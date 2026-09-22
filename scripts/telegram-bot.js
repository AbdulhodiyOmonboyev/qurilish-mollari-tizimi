const { Bot, InlineKeyboard, Keyboard } = require("grammy");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { parseVoiceExpense } = require("./voice-ai");
require("dotenv").config();

const prisma = new PrismaClient();
const token = process.env.TELEGRAM_BOT_TOKEN;

const adminFilePath = path.join(__dirname, "admin_id.txt");
const sessionsFilePath = path.join(__dirname, "bot_sessions.json");

let adminId = process.env.ADMIN_TELEGRAM_ID;
if (!adminId && fs.existsSync(adminFilePath)) {
  try {
    adminId = fs.readFileSync(adminFilePath, "utf-8").trim();
  } catch (e) {}
}

// Bot sessiyalarini fayldan o'qish va saqlash
let sessions = {};
try {
  if (fs.existsSync(sessionsFilePath)) {
    sessions = JSON.parse(fs.readFileSync(sessionsFilePath, "utf-8"));
  }
} catch (e) {
  sessions = {};
}

function saveSessions() {
  try {
    fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2));
  } catch (e) {
    console.error("Sessiyani saqlashda xatolik:", e);
  }
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
    .text("🔄 Yangilash")
    .text("🚪 Chiqish")
    .resized();
}

function getCashierKeyboard() {
  return new Keyboard()
    .text("📊 Bugungi Hisobot")
    .text("⚠️ Kam qolgan tovarlar")
    .row()
    .text("📦 Ombor Holati")
    .text("🔄 Yangilash")
    .row()
    .text("🚪 Chiqish")
    .resized();
}

function getLoginKeyboard() {
  return new Keyboard().text("🔐 Tizimga Kirish").resized();
}

// Foydalanuvchi tizimga kirganligini tekshirish
function getAuthUser(userId) {
  const s = sessions[userId];
  if (s && s.step === "AUTHENTICATED" && s.user) {
    return s.user;
  }
  return null;
}

// Start komandasi
bot.command("start", async (ctx) => {
  const userId = ctx.from?.id.toString();
  const authUser = getAuthUser(userId);

  if (authUser) {
    const kb = authUser.role === "CASHIER" ? getCashierKeyboard() : getAdminKeyboard();
    await ctx.reply(
      `Assalomu alaykum, ${authUser.fullName}! 👋\n` +
      `Siz tizimda *${authUser.role}* sifatida faolsiz.\n\n` +
      `Quyidagi menyu orqali amallarni bajarishingiz mumkin:`,
      { reply_markup: kb, parse_mode: "Markdown" }
    );
    return;
  }

  // Agar kirilmagan bo'lsa, logindan boshlash
  sessions[userId] = { step: "WAITING_FOR_USERNAME" };
  saveSessions();

  await ctx.reply(
    `Assalomu alaykum! 🏪\n*Qurilish Mollari Boshqaruv Botiga* xush kelibsiz.\n\n` +
    `⚠️ Ushbu bot yopiq tizim hisoblanadi. Undan foydalanish uchun admin tomonidan ochib berilgan hisobingiz bilan kirishingiz kerak.\n\n` +
    `👤 *1-qadam:* Iltimos, *Foydalanuvchi Loginingizni (Username)* kiriting:\n_(Masalan: admin yoki kassir1)_`,
    { parse_mode: "Markdown", reply_markup: { remove_keyboard: true } }
  );
});

// Chiqish (Logout) komandasi
bot.command("logout", async (ctx) => {
  const userId = ctx.from?.id.toString();
  delete sessions[userId];
  saveSessions();

  await ctx.reply(
    `👋 Tizimdan muvaffaqiyatli chiqdingiz.\nQaytadan kirish uchun "🔐 Tizimga Kirish" tugmasini bosing yoki /start yozing.`,
    { reply_markup: getLoginKeyboard() }
  );
});

bot.hears("🚪 Chiqish", async (ctx) => {
  const userId = ctx.from?.id.toString();
  delete sessions[userId];
  saveSessions();

  await ctx.reply(
    `👋 Tizimdan muvaffaqiyatli chiqdingiz.\nQaytadan kirish uchun "🔐 Tizimga Kirish" tugmasini bosing yoki /start yozing.`,
    { reply_markup: getLoginKeyboard() }
  );
});

bot.hears("🔐 Tizimga Kirish", async (ctx) => {
  const userId = ctx.from?.id.toString();
  sessions[userId] = { step: "WAITING_FOR_USERNAME" };
  saveSessions();

  await ctx.reply(
    `👤 Iltimos, *Foydalanuvchi Loginingizni (Username)* kiriting:`,
    { parse_mode: "Markdown", reply_markup: { remove_keyboard: true } }
  );
});

// Bugungi hisobot
bot.hears(["📊 Bugungi Hisobot", "🔄 Yangilash"], async (ctx) => {
  const userId = ctx.from?.id.toString();
  const authUser = getAuthUser(userId);

  if (!authUser) {
    await ctx.reply("⚠️ Avval tizimga kiring. /start buyrug'ini bosing.");
    return;
  }

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

    let msg =
      `📊 *BUGUNGI SAVDO VA MOLIYA HISOBOTI*\n` +
      `📅 Sana: ${new Date().toLocaleDateString("uz-UZ")}\n\n` +
      `💰 *Jami Savdo (Kirim):* ${formatMoney(totalRevenue)}\n` +
      `💵 *Kassaga tushgan naqd:* ${formatMoney(cashCollected)}\n` +
      `📝 *Nasiyaga berilgan:* ${formatMoney(debtGiven)}\n` +
      `📦 *Sotilgan tovar tannarxi:* ${formatMoney(totalCost)}\n`;

    if (authUser.role !== "CASHIER") {
      msg +=
        `📉 *Bugungi chiqimlar:* ${formatMoney(totalExpenses)}\n` +
        `------------------------------------\n` +
        `💎 *SOF FOYDA:* ${formatMoney(netProfit)}\n`;
    }

    msg +=
      `🧾 *Savdolar soni:* ${orders.length} ta\n` +
      `👤 *Foydalanuvchi:* ${authUser.fullName} (${authUser.role})\n`;

    if (authUser.role !== "CASHIER") {
      msg += `\n🎙️ _Ovozli chiqim:_ Ovozli xabar (golosovoy) yuboring\n✍️ _Matnli chiqim:_ \`/chiqim <summa> <izoh>\``;
    }

    await ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
    await ctx.reply("Hisobotni olishda xatolik yuz berdi.");
  }
});

// Kam qolgan tovarlar
bot.hears("⚠️ Kam qolgan tovarlar", async (ctx) => {
  const userId = ctx.from?.id.toString();
  if (!getAuthUser(userId)) {
    await ctx.reply("⚠️ Avval tizimga kiring: /start");
    return;
  }

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
    lowStock.slice(0, 15).forEach((p, idx) => {
      msg += `${idx + 1}. *${p.name}*\n`;
      msg += `   Qoldiq: *${p.stockQuantity} ${p.unit}* (Min chegara: ${p.minStockAlert})\n`;
      msg += `   Sotuv narxi: ${formatMoney(p.salePrice)}\n\n`;
    });

    if (lowStock.length > 15) {
      msg += `...va yana ${lowStock.length - 15} ta tovar kam qolgan.`;
    }

    await ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
    await ctx.reply("Ma'lumotlarni olishda xatolik.");
  }
});

// Do'konlar qarzlari (Faqat ADMIN va MANAGER)
bot.hears("📑 Do'konlar Qarzi", async (ctx) => {
  const userId = ctx.from?.id.toString();
  const authUser = getAuthUser(userId);

  if (!authUser) {
    await ctx.reply("⚠️ Avval tizimga kiring: /start");
    return;
  }

  if (authUser.role === "CASHIER") {
    await ctx.reply("🚫 Ushbu bo'lim faqat Admin va Menejerlar uchun ochiq.");
    return;
  }

  try {
    const partners = await prisma.partner.findMany({
      where: { totalDebt: { gt: 0 } },
      orderBy: { totalDebt: "desc" },
    });

    if (partners.length === 0) {
      await ctx.reply("🎉 Ajoyib! Hozirda hech qaysi do'kon yoki mijozning qarzi yo'q.");
      return;
    }

    const totalDebt = partners.reduce((sum, p) => sum + p.totalDebt, 0);
    let msg = `📑 *DO'KONLARNING NASIYA QARZLARI:*\n`;
    msg += `Jami nasiya summasi: *${formatMoney(totalDebt)}*\n\n`;

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
  const userId = ctx.from?.id.toString();
  const authUser = getAuthUser(userId);

  if (!authUser) {
    await ctx.reply("⚠️ Avval tizimga kiring: /start");
    return;
  }

  try {
    const products = await prisma.product.findMany({ where: { isActive: true } });
    const totalCost = products.reduce((sum, p) => sum + p.stockQuantity * p.costPrice, 0);
    const totalSale = products.reduce((sum, p) => sum + p.stockQuantity * p.salePrice, 0);

    let msg = `📦 *OMBOR UMUMIY QIYMATI:*\n\n`;
    msg += `🔹 Jami tovar turlari: *${products.length} xil*\n`;

    if (authUser.role !== "CASHIER") {
      msg +=
        `🔹 Ombor tannarx qiymati: *${formatMoney(totalCost)}*\n` +
        `🔹 Sotuvdagi umumiy qiymati: *${formatMoney(totalSale)}*\n` +
        `🔹 Kutilayotgan umumiy foyda: *${formatMoney(totalSale - totalCost)}*`;
    } else {
      msg += `🔹 Sotuvdagi umumiy qiymati: *${formatMoney(totalSale)}*`;
    }

    await ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
  }
});

// Tezkor chiqim kiritish: /chiqim <summa> <izoh>
bot.command("chiqim", async (ctx) => {
  const userId = ctx.from?.id.toString();
  const authUser = getAuthUser(userId);

  if (!authUser) {
    await ctx.reply("⚠️ Avval tizimga kiring: /start");
    return;
  }

  if (authUser.role === "CASHIER") {
    await ctx.reply("🚫 Chiqim kiritish huquqi faqat Admin va Menejerlarga berilgan.");
    return;
  }

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
    const note = parts.slice(1).join(" ") || `Bot orqali kiritildi (${authUser.fullName})`;

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
        note: `${note} [Kiritdi: ${authUser.fullName}]`,
        date: new Date(),
      },
    });

    await ctx.reply(
      `✅ Chiqim tizimga saqlandi!\n💰 Summa: *${formatMoney(amount)}*\n📝 Izoh: ${note}\n👤 Mas'ul: ${authUser.fullName}`,
      { parse_mode: "Markdown" }
    );
  } catch (e) {
    console.error(e);
    await ctx.reply("Chiqimni saqlashda xatolik.");
  }
});

// Ovozli xabarlar (Golosovoy) orqali AI bilan xarajat kiritish
bot.on(["message:voice", "message:audio"], async (ctx) => {
  const userId = ctx.from?.id.toString();
  const authUser = getAuthUser(userId);

  if (!authUser) {
    await ctx.reply(
      "⚠️ Ovozli xabar orqali xarajat kiritish uchun avval tizimga kiring: /start",
      { reply_markup: getLoginKeyboard() }
    );
    return;
  }

  if (authUser.role === "CASHIER") {
    await ctx.reply("🚫 Chiqim kiritish huquqi faqat Admin va Menejerlarga berilgan.");
    return;
  }

  const statusMsg = await ctx.reply(
    "🎙️ Ovozli xabar qabul qilindi. AI orqali tinglanmoqda va tahlil qilinmoqda... ⏳"
  );

  try {
    const voice = ctx.message.voice || ctx.message.audio;
    const file = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

    const fileRes = await fetch(fileUrl);
    const arrayBuf = await fileRes.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuf);
    const mimeType = voice.mime_type || "audio/ogg";

    const result = await parseVoiceExpense(audioBuffer, mimeType, ctx.message.caption);

    if (result.error === "NO_AI_KEY") {
      await ctx.api.editMessageText(
        ctx.chat.id,
        statusMsg.message_id,
        `🎙️ *Ovozli xabaringiz qabul qilindi!*\n\n` +
        `Ovozni avtomatik eshitib, xarajatga qo'shish uchun bepul *Google Gemini API Key* kerak bo'ladi.\n\n` +
        `💡 *1 daqiqada ulash tartibi:*\n` +
        `1. [aistudio.google.com](https://aistudio.google.com) saytidan bepul Gemini API key oling.\n` +
        `2. Render yoki \`.env\` fayliga \`GEMINI_API_KEY\` qilib qo'shing.\n\n` +
        `Hozircha xarajatni matn ko'rinishida ham kiritishingiz mumkin:\n\`/chiqim <summa> <izoh>\``,
        { parse_mode: "Markdown" }
      );
      return;
    }

    if (!result.amount || result.amount <= 0) {
      await ctx.api.editMessageText(
        ctx.chat.id,
        statusMsg.message_id,
        `🎙️ *Ovozli xabar matni:* \n"${result.transcript}"\n\n` +
        `⚠️ Xabardan xarajat summasi aniqlanmadi. Iltimos, summani aniq aytib qaytadan ovoz yuboring (masalan: *"Bugun tushlikka 120 ming berdik"*).\n\nYoki buyruq orqali kiritishingiz mumkin:\n\`/chiqim <summa> <izoh>\``,
        { parse_mode: "Markdown" }
      );
      return;
    }

    // Kategoriyani topish yoki yaratish
    let cat = await prisma.expenseCategory.findFirst({
      where: { name: result.category },
    });

    if (!cat) {
      cat = await prisma.expenseCategory.findFirst({
        where: { name: "Boshqa xarajatlar" },
      });
    }

    // Chiqimni saqlash
    await prisma.expense.create({
      data: {
        categoryId: cat ? cat.id : undefined,
        amount: result.amount,
        paymentMethod: "CASH",
        note: `${result.note} [Ovozli AI: "${result.transcript}"]`,
        date: new Date(),
      },
    });

    await ctx.api.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      `🎙️ *Ovozli xabar eshitildi:*\n"${result.transcript}"\n\n` +
      `✅ *Chiqim tizimga muvaffaqiyatli saqlandi!*\n` +
      `💰 Summa: *${formatMoney(result.amount)}*\n` +
      `📁 Kategoriya: *${cat ? cat.name : result.category}*\n` +
      `📝 Izoh: ${result.note}\n` +
      `🤖 AI Dvigateli: ${result.engine || "AI Voice"}\n` +
      `👤 Mas'ul: ${authUser.fullName}`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    console.error("Ovozli xabarni tahlil qilishda xatolik:", err);
    await ctx.api.editMessageText(
      ctx.chat.id,
      statusMsg.message_id,
      `❌ Ovozli xabarni tahlil qilishda xatolik yuz berdi: ${err.message}`
    );
  }
});

// Matnli xabarlar bilan ishlash (Login va Parol kiritish jarayoni)
bot.on("message:text", async (ctx) => {
  const userId = ctx.from?.id.toString();
  const text = ctx.message.text.trim();
  const userSession = sessions[userId] || {};

  // 1. Agar foydalanuvchi logini kutilayotgan bo'lsa
  if (userSession.step === "WAITING_FOR_USERNAME") {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { username: text },
      });

      if (!dbUser) {
        await ctx.reply(
          `❌ "*${text}*" nomli foydalanuvchi topilmadi!\n\n` +
          `Iltimos, admin tomonidan tizimda ochib berilgan to'g'ri loginingizni (Username) kiriting:`,
          { parse_mode: "Markdown" }
        );
        return;
      }

      if (!dbUser.isActive) {
        delete sessions[userId];
        saveSessions();
        await ctx.reply(
          `🚫 Ushbu hisob (*${dbUser.username}*) ma'muriyat tomonidan vaqtincha nofaol qilingan.\n` +
          `Iltimos, bosh admin bilan bog'laning.`,
          { parse_mode: "Markdown", reply_markup: getLoginKeyboard() }
        );
        return;
      }

      // Foydalanuvchi topildi, endi parolni so'raymiz
      sessions[userId] = {
        step: "WAITING_FOR_PASSWORD",
        tempUserId: dbUser.id,
        tempUsername: dbUser.username,
        tempFullName: dbUser.fullName,
        tempRole: dbUser.role,
      };
      saveSessions();

      await ctx.reply(
        `👤 Foydalanuvchi: *${dbUser.fullName}* (${dbUser.role})\n\n` +
        `🔑 *2-qadam:* Iltimos, hisobingiz *parolini (kodini)* kiriting:`,
        { parse_mode: "Markdown" }
      );
      return;
    } catch (e) {
      console.error(e);
      await ctx.reply("Bazadan tekshirishda xatolik yuz berdi.");
      return;
    }
  }

  // 2. Agar foydalanuvchi paroli kutilayotgan bo'lsa
  if (userSession.step === "WAITING_FOR_PASSWORD") {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userSession.tempUserId },
      });

      if (!dbUser) {
        sessions[userId] = { step: "WAITING_FOR_USERNAME" };
        saveSessions();
        await ctx.reply("Foydalanuvchi topilmadi. Qaytadan login kiriting:");
        return;
      }

      const isPasswordValid = bcrypt.compareSync(text, dbUser.passwordHash);

      if (!isPasswordValid) {
        await ctx.reply(
          `❌ *Parol noto'g'ri kiritildi!*\n\n` +
          `Iltimos, *${dbUser.fullName}* hisobining parolini qaytadan kiriting:\n_(Agar boshqa hisob bilan kirmoqchi bo'lsangiz, /start buyrug'ini bosing)_`,
          { parse_mode: "Markdown" }
        );
        return;
      }

      // Parol to'g'ri! Sessiyani saqlaymiz
      sessions[userId] = {
        step: "AUTHENTICATED",
        user: {
          id: dbUser.id,
          username: dbUser.username,
          fullName: dbUser.fullName,
          role: dbUser.role,
        },
      };
      saveSessions();

      // Agar ADMIN bo'lsa, xabarnomalar uchun adminId ga biriktiramiz
      if (dbUser.role === "ADMIN") {
        adminId = userId;
        try {
          fs.writeFileSync(adminFilePath, userId);
        } catch (e) {}
      }

      const kb = dbUser.role === "CASHIER" ? getCashierKeyboard() : getAdminKeyboard();

      await ctx.reply(
        `🎉 *Muvaffaqiyatli kirdingiz!*\n\n` +
        `👤 *Ism:* ${dbUser.fullName}\n` +
        `🎯 *Rol:* ${dbUser.role}\n` +
        `📱 *Telegram ID:* \`${userId}\`\n\n` +
        `Endi quyidagi menyu orqali do'kon ma'lumotlarini boshqarishingiz mumkin:`,
        { parse_mode: "Markdown", reply_markup: kb }
      );
      return;
    } catch (e) {
      console.error(e);
      await ctx.reply("Parolni tekshirishda xatolik yuz berdi.");
      return;
    }
  }

  // 3. Agar tizimga kirmagan bo'lsa va boshqa narsa yozsa
  const authUser = getAuthUser(userId);
  if (!authUser) {
    await ctx.reply(
      `⚠️ Siz hali botga kirmagansiz.\nIltimos, "🔐 Tizimga Kirish" tugmasini bosing yoki /start yozing:`,
      { reply_markup: getLoginKeyboard() }
    );
  }
});

bot.catch((err) => {
  console.error("Bot xatoligi:", err);
});

bot.start({
  onStart(botInfo) {
    console.log(`Telegram Bot @${botInfo.username} (ID: ${botInfo.id}) muvaffaqiyatli ishga tushdi!`);
  },
});
