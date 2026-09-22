const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function runPostgresVerification() {
  console.log("========================================================");
  console.log("  POSTGRESQL & XAVFSIZLIK INTEGRATSION SINOVI BOSHLANDI ");
  console.log("========================================================");

  // 1. PostgreSQL bazasiga ulanish va jadvallarni tekshirish
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();
  const appCount = await prisma.application.count();

  console.log(`[1] PostgreSQL bazasi holati:`);
  console.log(`    - Tovarlar soni: ${productsCount} ta`);
  console.log(`    - Foydalanuvchilar: ${usersCount} nafar`);
  console.log(`    - Arizalar: ${appCount} ta`);

  if (productsCount === 0 || usersCount === 0) {
    throw new Error("Bazada tovarlar yoki foydalanuvchilar topilmadi!");
  }

  // 2. Admin login tekshiruvi (bcrypt xesh bilan)
  const admin = await prisma.user.findUnique({ where: { username: "admin" } });
  const isMatch = await bcrypt.compare("admin123", admin.passwordHash);
  console.log(`[2] Admin paroli tekshiruvi: ${isMatch ? "MUVAFFAQIYATLI (To'g'ri)" : "XATO"}`);
  if (!isMatch) throw new Error("Admin paroli xato solishtirildi!");

  // 3. Yangi kassir yaratish
  const testUsername = "kassir_test_" + Date.now().toString().slice(-4);
  const testHash = await bcrypt.hash("parol123", 10);
  const newStaff = await prisma.user.create({
    data: {
      username: testUsername,
      passwordHash: testHash,
      fullName: "Sinov Kassiri",
      role: "CASHIER",
      phone: "+998901119988",
    },
  });
  console.log(`[3] Yangi xodim yaratildi: ${newStaff.fullName} (${newStaff.username}, Roli: ${newStaff.role})`);

  // 4. Onlayn do'kondan Ariza qoldirish
  const newApp = await prisma.application.create({
    data: {
      fullName: "Otabek Saidov",
      phone: "+998912223344",
      organization: "Yangi Bino Qurilishi",
      address: "Toshkent sh., Mirzo Ulug'bek",
      requestedItems: "1000 qop sement M-400, 3000 dona g'isht",
      note: "Ulgurji narxda hisoblab bering",
      status: "YANGI",
    },
  });
  console.log(`[4] Yangi ariza saqlandi: ID: ${newApp.id}, Mijoz: ${newApp.fullName}`);

  // 4.1 Ariza holatini yangilash (Admin tomonidan)
  const updatedApp = await prisma.application.update({
    where: { id: newApp.id },
    data: {
      status: "ALOQADA",
      adminNote: "Mijozga qo'ng'iroq qilindi, narxlar ma'qul keldi",
    },
  });
  console.log(`    Ariza holati yangilandi: ${updatedApp.status} (Izoh: ${updatedApp.adminNote})`);

  // 5. Savdo va ombor qoldig'i (Bekobod Sement)
  const sement = await prisma.product.findFirst({ where: { code: "SEM-400-50" } });
  const initialStock = sement.stockQuantity;

  const partner = await prisma.partner.findFirst({ where: { type: "STORE_CLIENT" } });
  const initialDebt = partner.totalDebt;

  const sellQty = 10;
  const orderAmount = sellQty * sement.salePrice;
  const paidCash = 200000;
  const debt = orderAmount - paidCash;

  const order = await prisma.order.create({
    data: {
      orderNumber: "PG-ORD-" + Date.now(),
      partnerId: partner.id,
      source: "POS",
      status: "COMPLETED",
      totalAmount: orderAmount,
      totalCost: sellQty * sement.costPrice,
      paidAmount: paidCash,
      debtAmount: debt,
      paymentStatus: "PARTIAL",
      paymentMethod: "MIXED",
      items: {
        create: [
          {
            productId: sement.id,
            productName: sement.name,
            unit: sement.unit,
            quantity: sellQty,
            costPrice: sement.costPrice,
            unitPrice: sement.salePrice,
            totalPrice: orderAmount,
          },
        ],
      },
    },
  });

  const sementAfter = await prisma.product.update({
    where: { id: sement.id },
    data: { stockQuantity: { decrement: sellQty } },
  });

  const partnerAfter = await prisma.partner.update({
    where: { id: partner.id },
    data: { totalDebt: { increment: debt } },
  });

  console.log(`[5] Savdo o'tkazildi (Chek: ${order.orderNumber}):`);
  console.log(`    - Sement qoldig'i: ${initialStock} -> ${sementAfter.stockQuantity} ${sement.unit}`);
  console.log(`    - Hamkor qarzi: ${initialDebt} -> ${partnerAfter.totalDebt} so'm`);

  // 6. To'lov qabul qilish
  await prisma.debtPayment.create({
    data: {
      partnerId: partner.id,
      amount: debt,
      paymentMethod: "CASH",
      note: "Nasiya to'liq yopildi",
    },
  });
  const partnerSettled = await prisma.partner.update({
    where: { id: partner.id },
    data: { totalDebt: { decrement: debt } },
  });
  console.log(`[6] Qarz to'lovi qabul qilindi: Hamkor yangi qarzi: ${partnerSettled.totalDebt} so'm`);

  // Tozalash: sinov xodimini o'chirish
  await prisma.user.delete({ where: { id: newStaff.id } });

  console.log("========================================================");
  console.log("  BARCHA TESTLAR POSTGRESQL'DA 100% MUVAFFAQ BO'LDI! ✅ ");
  console.log("========================================================");
}

runPostgresVerification()
  .catch((e) => {
    console.error("Xatolik:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
