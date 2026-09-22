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

  console.log("Toza va real ma'lumotlar kiritilmoqda...");

  // 1. Admin va Xodim Foydalanuvchilar (Bcrypt bilan xeshlangan parol)
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const cashierPasswordHash = await bcrypt.hash("kassir123", 10);

  await prisma.user.create({
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
    { name: "Oziq-ovqat va tushlik" },
    { name: "Boshqa xarajatlar" },
  ];
  for (const cat of expCategories) {
    await prisma.expenseCategory.create({ data: cat });
  }

  // 3. Hamkorlar (Do'konlar, Ta'minotchilar - boshlang'ich qarzi 0)
  await prisma.partner.create({
    data: {
      name: "Usta Jasur (Sergeli)",
      type: "STORE_CLIENT",
      phone: "+998901112233",
      address: "Toshkent sh., Sergeli tumani",
      totalDebt: 0,
      note: "Doimiy usta",
    },
  });

  await prisma.partner.create({
    data: {
      name: "Farhod Qurilish Do'koni",
      type: "STORE_CLIENT",
      phone: "+998935554433",
      address: "Toshkent sh., Uchtepa, Farhod bozori",
      totalDebt: 0,
      note: "Hamkor do'kon",
    },
  });

  await prisma.partner.create({
    data: {
      name: "Bekobod Sement Zavodi",
      type: "SUPPLIER",
      phone: "+998977778899",
      address: "Bekobod sh.",
      totalDebt: 0,
      note: "Sement yetkazib beruvchi ta'minotchi",
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

  const catTom = await prisma.category.create({
    data: {
      name: "Tom va Devor Qoplamalari",
      slug: "tom-devor-qoplamalari",
      description: "Gipsokarton, shifer, profnastil, mix va samorezlar",
    },
  });

  // 5. Ombordagi tovarlar bo'sh qoldiriladi (foydalanuvchi o'z tovarlarini kiritishi uchun)
  console.log("✅ Ombor tozalandi. Foydalanuvchi noldan o'z tovarlarini kiritishi mumkin.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
