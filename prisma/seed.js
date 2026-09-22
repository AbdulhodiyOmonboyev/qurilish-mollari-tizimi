const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("PostgreSQL ma'lumotlar bazasi tozalanmoqda...");
  await prisma.application.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.debtPayment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.user.deleteMany();

  console.log("Boshlang'ich ma'lumotlar kiritilmoqda...");

  // 1. Admin va Xodim Foydalanuvchilar (Bcrypt bilan xeshlangan parol)
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const cashierPasswordHash = await bcrypt.hash("kassir123", 10);

  const adminUser = await prisma.user.create({
    data: {
      username: "admin",
      passwordHash: adminPasswordHash,
      fullName: "Do'kon Egasi (Bosh Admin)",
      role: "ADMIN",
      phone: "+998901234567",
      isActive: true,
    },
  });

  await prisma.user.create({
    data: {
      username: "kassir1",
      passwordHash: cashierPasswordHash,
      fullName: "Aliyev Nodir (Kassir)",
      role: "CASHIER",
      phone: "+998931112233",
      isActive: true,
    },
  });

  // 2. Chiqim Kategoriyalari
  const expCategories = [
    { name: "Tovar xaridi" },
    { name: "Do'kon/Ombor ijarasi" },
    { name: "Ish haqi (Oylik)" },
    { name: "Transport va logistika" },
    { name: "Kommunal to'lovlar" },
    { name: "Soliq va litsenziya" },
    { name: "Boshqa xarajatlar" },
  ];
  for (const cat of expCategories) {
    await prisma.expenseCategory.create({ data: cat });
  }

  // 3. Hamkorlar (Do'konlar, Ta'minotchilar)
  const p1 = await prisma.partner.create({
    data: {
      name: "Usta Jasur (Sergeli)",
      type: "STORE_CLIENT",
      phone: "+998901112233",
      address: "Toshkent sh., Sergeli tumani, 4-mavze",
      totalDebt: 3200000,
      note: "Doimiy usta, nasiyaga oladi",
    },
  });

  const p2 = await prisma.partner.create({
    data: {
      name: "Farhod Qurilish Do'koni",
      type: "STORE_CLIENT",
      phone: "+998935554433",
      address: "Toshkent sh., Uchtepa, Farhod bozori 12-do'kon",
      totalDebt: 7500000,
      note: "Katta hajmda oladigan hamkor do'kon",
    },
  });

  const p3 = await prisma.partner.create({
    data: {
      name: "Bekzod Ta'minotchi (Bekobod Sement)",
      type: "SUPPLIER",
      phone: "+998977778899",
      address: "Bekobod sh.",
      totalDebt: 0,
      note: "Sement yetkazib beruvchi zavod vakili",
    },
  });

  // 4. Mahsulot Kategoriyalari
  const catSement = await prisma.category.create({
    data: {
      name: "Sement va Bog'lovchilar",
      slug: "sement-boglovchilar",
      description: "Sement, alebastr, gips va ohak",
    },
  });

  const catGisht = await prisma.category.create({
    data: {
      name: "G'isht va Bloklar",
      slug: "gisht-bloklar",
      description: "Pishgan g'isht, shlakoblok, gazoblok",
    },
  });

  const catQorishma = await prisma.category.create({
    data: {
      name: "Quruq qorishmalar",
      slug: "quruq-qorishmalar",
      description: "Shpaklyovka, rotband, kafel yelimlari",
    },
  });

  const catMetall = await prisma.category.create({
    data: {
      name: "Metall va Armatura",
      slug: "metall-armatura",
      description: "Armatura, katanka, profil trubalar",
    },
  });

  const catBoyoq = await prisma.category.create({
    data: {
      name: "Bo'yoq va Laklar",
      slug: "boyoq-laklar",
      description: "Emulsiya, moyli bo'yoq, gruntovka",
    },
  });

  const catSantexnika = await prisma.category.create({
    data: {
      name: "Santexnika va Quvurlar",
      slug: "santexnika-quvurlar",
      description: "Plastik quvurlar, fitinglar, kranlar",
    },
  });

  // 5. Tovarlar (Products)
  const productsData = [
    {
      categoryId: catSement.id,
      name: "Bekobod Sement M-400 (50 kg)",
      code: "SEM-400-50",
      barcode: "478001234001",
      unit: "qop",
      costPrice: 58000,
      salePrice: 68000,
      stockQuantity: 240,
      minStockAlert: 50,
      description: "Yuqori sifatli Bekobod M-400 markali sement",
    },
    {
      categoryId: catSement.id,
      name: "Ohak (Izvest) 20 kg",
      code: "OHAK-20",
      barcode: "478001234002",
      unit: "qop",
      costPrice: 18000,
      salePrice: 24000,
      stockQuantity: 45,
      minStockAlert: 20,
      description: "Oqartirish va qurilish uchun ohak",
    },
    {
      categoryId: catGisht.id,
      name: "Pishgan g'isht (Standart)",
      code: "GSHT-PISH",
      barcode: "478001234003",
      unit: "dona",
      costPrice: 950,
      salePrice: 1300,
      stockQuantity: 8500,
      minStockAlert: 2000,
      description: "Sifatli pishiq g'isht, devorlar uchun",
    },
    {
      categoryId: catGisht.id,
      name: "Gazoblok D-500 (600x300x200)",
      code: "BLOK-GAZ-200",
      barcode: "478001234004",
      unit: "dona",
      costPrice: 16500,
      salePrice: 21000,
      stockQuantity: 18,
      minStockAlert: 50,
      description: "Issiqlik saqlovchi yengil gazoblok",
    },
    {
      categoryId: catQorishma.id,
      name: "Knauf Rotband Shpatlyovka (30 kg)",
      code: "KNF-ROTB-30",
      barcode: "478001234005",
      unit: "qop",
      costPrice: 54000,
      salePrice: 65000,
      stockQuantity: 120,
      minStockAlert: 25,
      description: "Gipsli universal suvoq qorishmasi",
    },
    {
      categoryId: catQorishma.id,
      name: "Kafel yelimi Master Fix (25 kg)",
      code: "KFL-FIX-25",
      barcode: "478001234006",
      unit: "qop",
      costPrice: 32000,
      salePrice: 42000,
      stockQuantity: 85,
      minStockAlert: 20,
      description: "Ichki va tashqi kafel terish uchun yelim",
    },
    {
      categoryId: catMetall.id,
      name: "Armatura d-12 (A500C)",
      code: "ARM-12",
      barcode: "478001234007",
      unit: "metr",
      costPrice: 8200,
      salePrice: 10500,
      stockQuantity: 1400,
      minStockAlert: 300,
      description: "O'zmetkombinat 12mm mustahkam armatura",
    },
    {
      categoryId: catMetall.id,
      name: "Profil truba 40x40x2.0 mm",
      code: "PRF-4040",
      barcode: "478001234008",
      unit: "metr",
      costPrice: 18000,
      salePrice: 23500,
      stockQuantity: 8,
      minStockAlert: 50,
      description: "Karkas va darvoza uchun metall profil",
    },
    {
      categoryId: catBoyoq.id,
      name: "Oq fasad emulsiyasi (20 kg)",
      code: "BOY-FAS-20",
      barcode: "478001234009",
      unit: "dona",
      costPrice: 140000,
      salePrice: 185000,
      stockQuantity: 32,
      minStockAlert: 10,
      description: "Yomg'ir va quyoshga chidamli fasad bo'yog'i",
    },
    {
      categoryId: catSantexnika.id,
      name: "Plastik quvur PPR d-25 (4 metr)",
      code: "SAN-PPR-25",
      barcode: "478001234010",
      unit: "dona",
      costPrice: 24000,
      salePrice: 34000,
      stockQuantity: 90,
      minStockAlert: 20,
      description: "Issiq va sovuq suv uchun bosimli quvur",
    },
  ];

  for (const item of productsData) {
    const prod = await prisma.product.create({ data: item });
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        type: "IN",
        quantity: prod.stockQuantity,
        costPrice: prod.costPrice,
        salePrice: prod.salePrice,
        referenceType: "manual",
        note: "Boshlang'ich ombor zaxirasi kiritildi",
      },
    });
  }

  // 6. Sinov arizalari (Applications)
  await prisma.application.create({
    data: {
      fullName: "Sardor Rahimov",
      phone: "+998909876543",
      organization: "Yangi Chilonzor Ko'p Qavatli Uy",
      address: "Toshkent sh., Chilonzor 9-mavze",
      requestedItems: "500 qop M-400 sement, 1500 dona gazoblok, 2 tonna armatura 12mm",
      note: "Ulgurji narx va yetkazib berish bo'yicha hisob-faktura kerak",
      status: "YANGI",
    },
  });

  await prisma.application.create({
    data: {
      fullName: "Muzaffar Qurilish MChJ",
      phone: "+998971234567",
      organization: "Muzaffar Stroy",
      address: "Zangiota tumani",
      requestedItems: "Kafel yelimi 100 qop, Rotband 80 qop",
      note: "Doimiy ta'minot bo'yicha shartnoma qilmoqchimiz",
      status: "ALOQADA",
      adminNote: "Mijoz bilan bog'lanildi, narxlar yuborildi",
    },
  });

  // 7. Savdo va Nasiya
  const sement = await prisma.product.findFirst({ where: { code: "SEM-400-50" } });
  const rotband = await prisma.product.findFirst({ where: { code: "KNF-ROTB-30" } });

  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-" + Date.now().toString().slice(-6),
      partnerId: p2.id,
      source: "POS",
      status: "COMPLETED",
      totalAmount: 4600000,
      totalCost: 3880000,
      paidAmount: 1600000,
      debtAmount: 3000000,
      paymentStatus: "PARTIAL",
      paymentMethod: "MIXED",
      customerName: "Farhod Qurilish Do'koni",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      note: "50 qop sement, 20 qop rotband nasiyaga berildi",
      items: {
        create: [
          {
            productId: sement.id,
            productName: sement.name,
            unit: sement.unit,
            quantity: 50,
            costPrice: sement.costPrice,
            unitPrice: sement.salePrice,
            totalPrice: 50 * sement.salePrice,
          },
          {
            productId: rotband.id,
            productName: rotband.name,
            unit: rotband.unit,
            quantity: 20,
            costPrice: rotband.costPrice,
            unitPrice: rotband.salePrice,
            totalPrice: 20 * rotband.salePrice,
          },
        ],
      },
    },
  });

  await prisma.debtPayment.create({
    data: {
      partnerId: p2.id,
      orderId: order1.id,
      amount: 1600000,
      paymentMethod: "CASH",
      note: "Buyurtma paytida naqd to'landi",
    },
  });

  // 8. Chiqimlar
  const ijaraCat = await prisma.expenseCategory.findFirst({ where: { name: "Do'kon/Ombor ijarasi" } });
  const transportCat = await prisma.expenseCategory.findFirst({ where: { name: "Transport va logistika" } });

  if (ijaraCat) {
    await prisma.expense.create({
      data: {
        categoryId: ijaraCat.id,
        amount: 2500000,
        paymentMethod: "TRANSFER",
        note: "Omborning oylik ijara to'lovi",
      },
    });
  }

  if (transportCat) {
    await prisma.expense.create({
      data: {
        categoryId: transportCat.id,
        amount: 350000,
        paymentMethod: "CASH",
        note: "Zavoddan sement keltirish yuk mashinasi yoqilg'isi",
      },
    });
  }

  console.log("PostgreSQL bazasiga barcha ma'lumotlar muvaffaqiyatli kiritildi!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
