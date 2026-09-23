import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const settingsFilePath = path.join(process.cwd(), "settings.json");

const defaultSettings = {
  storeName: "HARD_WALL.UZ",
  slogan: "Asosiysi sifat - Serpyanka ishlab chiqaruvchi",
  ownerName: "Abdullo (Ishlab chiqaruvchi)",
  phone1: "+998 90 769 35 39",
  phone2: "+998 99 769 35 39",
  instagram: "@hard_wall.uz",
  address: "Toshkent shahri, Sergeli tumani, Yangi Sergeli ko'chasi",
  currency: "UZS",
  receiptNote: "HARD_WALL.UZ - Ishonchli va mustahkam! Xaridingiz uchun rahmat.",
  telegramBotUsername: "for_my_dad1_bot",
};

function getSettings() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const data = fs.readFileSync(settingsFilePath, "utf-8");
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error("Error reading settings.json:", e);
  }
  return defaultSettings;
}

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = getSettings();
    const updated = { ...current, ...body };

    fs.writeFileSync(settingsFilePath, JSON.stringify(updated, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Sozlamalar saqlandi",
    });
  } catch (error: any) {
    console.error("Settings save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
