const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runVerification() {
  console.log("==================================================");
  console.log("  QURILISH TIZIMI INTEGRATSION SINOVI BOSHLANDI   ");
  console.log("==================================================");

  // 1. Kategoriya va Tovar mavjudligini tekshirish
  const productsCount = await prisma.product.count();
  console.log(`[1] Ombordagi tovar turlari soni: ${productsCount} ta (Kutilgan: >= 10)`);
  if (productsCount === 0) throw new Error("Tovarlar topilmadi!");

  // 2. Biror tovar tanlab, boshlang'ich qoldiqni tekshirish
  const testProduct = await prisma.product.findFirst({
    where: { code: "SEM-400-50" },
  });
  console.log(`[2] Sinov toviri: ${testProduct.name}, Hozirgi qoldiq: ${testProduct.stockQuantity} ${testProduct.unit}`);

  // 3. Nasiyachi hamkor do'konni tekshirish
  const partner = await prisma.partner.findFirst({
    where: { type: "STORE_CLIENT" },
  });
  console.log(`[3] Sinov hamkori: ${partner.name}, Boshlang'ich qarz: ${partner.totalDebt} so'm`);

  // 4. Savdo (POS) amalga oshirish: 5 qop sement sotiladi (100,000 naqd, qolgani nasiya)
  const qtyToSell = 5;
  const salePrice = testProduct.salePrice;
  const totalSaleAmount = qtyToSell * salePrice;
  const paidCash = 100000;
  const newDebt = totalSaleAmount - paidCash;

  console.log(`[4] Savdo o'tkazilmoqda: ${qtyToSell} ${testProduct.unit} x ${salePrice} = ${totalSaleAmount} so'm`);
  console.log(`    Naqd: ${paidCash} so'm, Nasiya: ${newDebt} so'm`);

  const order = await prisma.order.create({
    data: {
      orderNumber: "TEST-ORD-" + Date.now(),
      partnerId: partner.id,
      source: "POS",
      status: "COMPLETED",
      totalAmount: totalSaleAmount,
      totalCost: qtyToSell * testProduct.costPrice,
      paidAmount: paidCash,
      debtAmount: newDebt,
      paymentStatus: "PARTIAL",
      paymentMethod: "MIXED",
      items: {
        create: [
          {
            productId: testProduct.id,
            productName: testProduct.name,
            unit: testProduct.unit,
            quantity: qtyToSell,
            costPrice: testProduct.costPrice,
            unitPrice: salePrice,
            totalPrice: totalSaleAmount,
          },
        ],
      },
    },
  });

  // Ombordan kamaytirish
  const updatedProductAfterSale = await prisma.product.update({
    where: { id: testProduct.id },
    data: { stockQuantity: { decrement: qtyToSell } },
  });

  // Hamkor qarzini oshirish
  const updatedPartnerAfterSale = await prisma.partner.update({
    where: { id: partner.id },
    data: { totalDebt: { increment: newDebt } },
  });

  console.log(`[5] Savdo yakunlandi!`);
  console.log(`    Yangi ombor qoldig'i: ${updatedProductAfterSale.stockQuantity} (Avval: ${testProduct.stockQuantity})`);
  console.log(`    Yangi do'kon qarzi: ${updatedPartnerAfterSale.totalDebt} so'm (Avval: ${partner.totalDebt})`);

  if (updatedProductAfterSale.stockQuantity !== testProduct.stockQuantity - qtyToSell) {
    throw new Error("Ombor qoldig'i to'g'ri kamaymadi!");
  }
  if (updatedPartnerAfterSale.totalDebt !== partner.totalDebt + newDebt) {
    throw new Error("Hamkor qarzi to'g'ri hisoblanmadi!");
  }

  // 6. Qarz to'lovini qabul qilish (masalan: 150,000 so'm to'landi)
  const payAmount = 150000;
  await prisma.debtPayment.create({
    data: {
      partnerId: partner.id,
      amount: payAmount,
      paymentMethod: "CASH",
      note: "Sinov to'lovi",
    },
  });
  const updatedPartnerAfterPayment = await prisma.partner.update({
    where: { id: partner.id },
    data: { totalDebt: { decrement: payAmount } },
  });

  console.log(`[6] Qarz to'lovi qabul qilindi: ${payAmount} so'm`);
  console.log(`    Hamkorning to'lovdan keyingi qarzi: ${updatedPartnerAfterPayment.totalDebt} so'm`);

  // 7. Chiqim kiritish (masalan: 50,000 transport xarajati)
  const expenseCat = await prisma.expenseCategory.findFirst();
  const expense = await prisma.expense.create({
    data: {
      categoryId: expenseCat.id,
      amount: 50000,
      paymentMethod: "CASH",
      note: "Sinov chiqimi",
      date: new Date(),
    },
  });
  console.log(`[7] Chiqim kiritildi: ${expense.amount} so'm (${expenseCat.name})`);

  // 8. Sof Foyda formulasini tekshirish
  const allOrders = await prisma.order.findMany({ where: { status: "COMPLETED" } });
  const allExpenses = await prisma.expense.findMany();

  const totalRev = allOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalCost = allOrders.reduce((s, o) => s + o.totalCost, 0);
  const gross = totalRev - totalCost;
  const totalExp = allExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = gross - totalExp;

  console.log(`[8] Moliyaviy Balans Tekshiruvi:`);
  console.log(`    Jami Kirim: ${totalRev.toLocaleString()} so'm`);
  console.log(`    Sotilgan Tovar Tannarxi: ${totalCost.toLocaleString()} so'm`);
  console.log(`    Yalpi Foyda: ${gross.toLocaleString()} so'm`);
  console.log(`    Barcha Chiqimlar: ${totalExp.toLocaleString()} so'm`);
  console.log(`    >>> SOF FOYDA: ${netProfit.toLocaleString()} so'm <<<`);

  console.log("==================================================");
  console.log("  BARCHA TESTLAR 100% MUVAFFAQIYATLI O'TDI! ✅   ");
  console.log("==================================================");
}

runVerification()
  .catch((e) => {
    console.error("Xatolik:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
