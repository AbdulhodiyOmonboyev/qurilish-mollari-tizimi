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

  // 5. Tovarlar (Products) - Yuqori sifatli rasmlar bilan
  const productsData = [
    {
      categoryId: catSement.id,
      name: "Bekobod Sement M-400 (50 kg)",
      code: "SEM-400-50",
      barcode: "478001234001",
      unit: "qop",
      costPrice: 58000,
      salePrice: 68000,
      stockQuantity: 350,
      minStockAlert: 50,
      imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80",
      description: "Yuqori sifatli Bekobod M-400 markali sement, poydevor va quyma ishlariga mos",
    },
    {
      categoryId: catSement.id,
      name: "Ohak (Izvest) 20 kg",
      code: "OHAK-20",
      barcode: "478001234002",
      unit: "qop",
      costPrice: 18000,
      salePrice: 24000,
      stockQuantity: 60,
      minStockAlert: 20,
      imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80",
      description: "Oqartirish va qurilish qorishmalari uchun yuqori sifatli ohak",
    },
    {
      categoryId: catGisht.id,
      name: "Pishgan g'isht (Standart M-100)",
      code: "GSHT-PISH",
      barcode: "478001234003",
      unit: "dona",
      costPrice: 950,
      salePrice: 1300,
      stockQuantity: 12000,
      minStockAlert: 2000,
      imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80",
      description: "Mustahkam va tekis qizil pishiq g'isht, ko'p qavatli va hovli devorlariga",
    },
    {
      categoryId: catGisht.id,
      name: "Gazoblok D-500 (600x300x200)",
      code: "BLOK-GAZ-200",
      barcode: "478001234004",
      unit: "dona",
      costPrice: 16500,
      salePrice: 21000,
      stockQuantity: 450,
      minStockAlert: 50,
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
      description: "Issiqlik va shovqin o'tkazmaydigan avtoklav gazobeton blok",
    },
    {
      categoryId: catQorishma.id,
      name: "Knauf Rotband Suvoq (30 kg)",
      code: "KNF-ROTB-30",
      barcode: "478001234005",
      unit: "qop",
      costPrice: 54000,
      salePrice: 65000,
      stockQuantity: 180,
      minStockAlert: 30,
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
      description: "Gipsli universal shuvoq qorishmasi, ichki devorlarni silliqlash uchun",
    },
    {
      categoryId: catQorishma.id,
      name: "Kafel yelimi Master Fix (25 kg)",
      code: "KFL-FIX-25",
      barcode: "478001234006",
      unit: "qop",
      costPrice: 32000,
      salePrice: 42000,
      stockQuantity: 140,
      minStockAlert: 25,
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
      description: "Ichki va tashqi keramik kafel terish uchun o'ta chidamli yelim",
    },
    {
      categoryId: catMetall.id,
      name: "Armatura d-12 (A500C)",
      code: "ARM-12",
      barcode: "478001234007",
      unit: "metr",
      costPrice: 8200,
      salePrice: 10500,
      stockQuantity: 2500,
      minStockAlert: 400,
      imageUrl: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=600&auto=format&fit=crop&q=80",
      description: "O'zmetkombinat zavodida ishlab chiqarilgan 12mm mustahkam riblyoniy armatura",
    },
    {
      categoryId: catMetall.id,
      name: "Profil truba 40x40x2.0 mm",
      code: "PRF-4040",
      barcode: "478001234008",
      unit: "metr",
      costPrice: 18000,
      salePrice: 23500,
      stockQuantity: 320,
      minStockAlert: 60,
      imageUrl: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&auto=format&fit=crop&q=80",
      description: "Karkas, bostirma va darvozalar uchun to'rtburchak po'lat profil",
    },
    {
      categoryId: catBoyoq.id,
      name: "Oq fasad emulsiyasi (20 kg)",
      code: "BOY-FAS-20",
      barcode: "478001234009",
      unit: "dona",
      costPrice: 140000,
      salePrice: 185000,
      stockQuantity: 45,
      minStockAlert: 10,
      imageUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80",
      description: "Yomg'ir, qor va oftobga chidamli yuqori qoplovchan oq fasad bo'yog'i",
    },
    {
      categoryId: catSantexnika.id,
      name: "Plastik quvur PPR d-25 (4 metr)",
      code: "SAN-PPR-25",
      barcode: "478001234010",
      unit: "dona",
      costPrice: 24000,
      salePrice: 34000,
      stockQuantity: 110,
      minStockAlert: 20,
      imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80",
      description: "Ichimlik suvi va isitish tizimi uchun 25mm bosimli plastik quvur",
    },
    {
      categoryId: catTom.id,
      name: "Knauf Gipsokarton 9.5 mm (1.2x2.5 m)",
      code: "GPS-95",
      barcode: "478001234011",
      unit: "dona",
      costPrice: 38000,
      salePrice: 48000,
      stockQuantity: 210,
      minStockAlert: 40,
      imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
      description: "Shift va devorlarni qoplash uchun Knauf gipsokarton listi",
    },
    {
      categoryId: catTom.id,
      name: "Shifer 8 to'lqinli (1.75x1.13 m)",
      code: "SHIF-8",
      barcode: "478001234012",
      unit: "dona",
      costPrice: 52000,
      salePrice: 65000,
      stockQuantity: 160,
      minStockAlert: 30,
      imageUrl: "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=600&auto=format&fit=crop&q=80",
      description: "Tom yopish uchun mustahkam 8 to'lqinli asbest sement shifer",
    },
    {
      categoryId: catTom.id,
      name: "Samorez qora 3.5x35 mm (1000 dona)",
      code: "SAM-35",
      barcode: "478001234013",
      unit: "quti",
      costPrice: 35000,
      salePrice: 48000,
      stockQuantity: 75,
      minStockAlert: 15,
      imageUrl: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&auto=format&fit=crop&q=80",
      description: "Gipsokarton va yog'och mahkamlash uchun po'lat qora samorez",
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

  console.log("✅ Toza ma'lumotlar va barcha tovarlar rasmlari muvaffaqiyatli kiritildi!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
