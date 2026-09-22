const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

async function cleanup() {
  console.log("🧹 Test ma'lumotlari tozalanmoqda...");

  const delOrders = await prisma.orderItem.deleteMany();
  console.log(`- OrderItems o'chirildi: ${delOrders.count}`);

  const delPayments = await prisma.debtPayment.deleteMany();
  console.log(`- DebtPayments o'chirildi: ${delPayments.count}`);

  const delAllOrders = await prisma.order.deleteMany();
  console.log(`- Orders o'chirildi: ${delAllOrders.count}`);

  const delApps = await prisma.application.deleteMany();
  console.log(`- Test arizalar (Applications) o'chirildi: ${delApps.count}`);

  const delExp = await prisma.expense.deleteMany();
  console.log(`- Test chiqimlar (Expenses) o'chirildi: ${delExp.count}`);

  // Hamkorlarning test qarzlari 0 ga tushiriladi
  const updatedPartners = await prisma.partner.updateMany({
    data: { totalDebt: 0 },
  });
  console.log(`- Hamkorlar qarzi 0 qilindi: ${updatedPartners.count}`);

  console.log("✅ Barcha test ma'lumotlari muvaffaqiyatli tozalandi!");
}

cleanup()
  .catch((e) => {
    console.error("Tozalashda xatolik:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
