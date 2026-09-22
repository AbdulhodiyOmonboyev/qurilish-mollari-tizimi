# Qurilish Mollari Savdo va Ombor Boshqaruv Tizimi 🏗️

Yakka tartibdagi tadbirkorlar va qurilish mollari savdosi bilan shug'ullanuvchi bizneslar uchun to'liq avtomatlashtirilgan boshqaruv ekotizimi.

**Asosiy Texnologiyalar:** Next.js 14 (App Router, Tailwind CSS), **PostgreSQL 18** (Prisma ORM), Jose / BcryptJS (JWT autentifikatsiya), GrammY (Telegram Bot), SheetJS (Excel) va jsPDF.

---

## 🌟 Tizim Imkoniyatlari va Yangi Modullar

### 1. 🔐 Admin Login va Xavfsizlik Tizimi
- Boshqaruv paneli (`/dashboard`, `/pos`, `/inventory`, `/debts`, `/finance`, `/orders`, `/users`, `/applications`) to'liq parol bilan himoyalangan.
- Tizimga kirmagan har qanday foydalanuvchi avtomatik ravishda `/login` sahifasiga yo'naltiriladi.
- **Mijozlar Onlayn Do'koni (`/shop`) va Ariza qoldirish formasi esa ochiq qoladi.**
- Boshlang'ich tizimga kirish ma'lumotlari:
  - **Login:** `admin`
  - **Parol:** `admin123`

### 2. 👥 Foydalanuvchilar (Xodimlar) Boshqaruvi (`/users`)
- Admin paneldan turib yangi xodimlar (foydalanuvchilar) yaratish.
- **Rollar bo'yicha taqsimot:**
  - `Bosh Admin (ADMIN)`: Tizimning barcha bo'limlariga to'liq kirish va sozlash huquqi.
  - `Menejer (MANAGER)`: Ombor, tovarlar qoldig'i, partiya kirim qilish va savdo.
  - `Kassir (CASHIER)`: Faqat kassa (POS), sotuv va chek chiqarish.
- Xodimlar parolini yangilash, faolligini o'zgartirish yoki o'chirish.

### 3. 📩 Ariza va Smeta Qoldirish Tizimi (`/shop` va `/applications`)
- **Mijozlar tomonidan:** Onlayn do'konda "Ariza Qoldirish" tugmasi orqali yirik qurilish obyekti, ulgurji narx so'rovi yoki smeta bo'yicha ariza yuborish imkoniyati.
- **Admin panelda (`/applications`):** Barcha kelib tushgan arizalar ro'yxati, mijoz telefoni va so'ralgan tovarlar ro'yxati.
- **Holat boshqaruvi:** `YANGI`, `ALOQADA` (Bog'lanildi), `YAKUNLANDI`, `BEKOR QILINDI`.
- **Telegram Xabarnoma:** Har gal yangi ariza tushganda do'kon egasining Telegram botiga tezkor signal keladi!

### 4. 🗄️ PostgreSQL Ma'lumotlar Bazasi
- Tizim to'liq **PostgreSQL 18** ma'lumotlar bazasida ishlaydi (`localhost:5432/qurilish_db`).
- Barcha amallar (savdo, kassa, ombor qoldiqlari, qarzlar, chiqimlar) yagona markaziy bazadan sinxronlashadi.

### 5. 🛒 Kassa va Tezkor Savdo (POS) (`/pos`)
- Mahsulot nomi yoki shtrix-kodi orqali savatga qo'shish.
- Narxni o'zgartirish (chegirma).
- **To'lov shakllari:** To'liq naqd, karta, qisman to'lov (qolgani nasiyaga) va to'liq nasiya.
- **Chop etishga tayyor Savdo Cheki (Receipt)**.

### 6. 📦 Ombor va Tovarlar Boshqaruvi (`/inventory`)
- Tovar qoldiqlari, minimal zaxira chegarasi nazorati.
- Ombor umumiy qiymati (tannarxda tikilgan pul va sotuv narxidagi kutilgan tushum).
- Yangi partiya kirim qilish va narxlarni yangilash.
- Tovar harakatlari tarixi.

### 7. 📑 Nasiya Daftari (Do'konlar Balansi) (`/debts`)
- Hamkor do'kon va ustalar profili, berilgan tovarlar tarixi.
- Qarz qoldig'i avtomatik hisoblanishi va qarz to'lovlarini qabul qilish.

### 8. 💰 Kirim-Chiqim va Sof Foyda Tahlili (`/finance`)
- Do'konning barcha chiqimlarini (ijara, ish haqi, transport, kommunal) kiritish.
- Formula: $\text{Kirim} - \text{Sotilgan Tovar Tannarxi} - \text{Chiqimlar} = \text{Sof Foyda}$.
- **Excel (.xlsx)** va **PDF** formatida hisobotlarni yuklab olish.

### 9. 🤖 Telegram Bot (`@for_my_dad1_bot`)
- Do'kon egasiga kunlik savdo, kassa va sof foyda hisoboti.
- Ombordagi kam qolgan tovarlar haqida ogohlantirish.
- Do'konlar qarzi haqida ma'lumot.
- `/chiqim <summa> <izoh>` orqali botdan turib xarajat kiritish.
- Yangi ariza kelib tushganda darhol botga xabar yuborish.

---

## 🚀 Tizimga Kirish Havolalari

Hozirda barcha xizmatlar fon rejimida faol ishlab turibdi:

| Bo'lim | Havola | Kirish huquqi |
| :--- | :--- | :--- |
| **Kirish Sahifasi** | [http://localhost:3000/login](http://localhost:3000/login) | Ochiq |
| **Boshqaruv Paneli** | [http://localhost:3000/dashboard](http://localhost:3000/dashboard) | Login talab qilinadi |
| **Kassa (POS)** | [http://localhost:3000/pos](http://localhost:3000/pos) | Login talab qilinadi |
| **Ombor** | [http://localhost:3000/inventory](http://localhost:3000/inventory) | Login talab qilinadi |
| **Nasiya Daftari** | [http://localhost:3000/debts](http://localhost:3000/debts) | Login talab qilinadi |
| **Moliya & Foyda** | [http://localhost:3000/finance](http://localhost:3000/finance) | Login talab qilinadi |
| **Xodimlar Boshqaruvi** | [http://localhost:3000/users](http://localhost:3000/users) | Faqat Admin |
| **Arizalar & So'rovlar** | [http://localhost:3000/applications](http://localhost:3000/applications) | Login talab qilinadi |
| **Mijozlar Onlayn Do'koni** | [http://localhost:3000/shop](http://localhost:3000/shop) | Barcha uchun ochiq |
| **Telegram Bot** | [@for_my_dad1_bot](https://t.me/for_my_dad1_bot) | Telegram orqali |

---

### 🔑 Boshlang'ich Login Ma'lumotlari:
- **Login:** `admin`
- **Parol:** `admin123`

*(Tizimga kirgach, `/users` bo'limida yangi kassirlar yaratishingiz yoki parolni o'zgartirishingiz mumkin).*
